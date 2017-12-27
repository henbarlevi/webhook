
import * as config from 'config';
import * as request from 'request';
// =============
// ====== models
// =============

import { iGoogleToken } from '../models/iGoogleToken.model';
import {  iWatchResponse } from '../models/iSubscriptionResponse.model';
import { iSubscriptionRequest } from '../models/iSubscriptionRequest.model';
import { iGmailHistory } from '../models/iGmailHistory.model';
import { iGmailMessage, iGmailMessagePayload } from '../models/iGmailMessage.model';
// =============
// ====== utils
// =============
import { Logger } from '../../utils/Logger';
const TAG: string = 'GmailService |';

const ENV: string = process.env.NODE_ENV || 'local';
const envConfig: any = config.get(ENV);
// ===================================
//setting Google app creds and settings
// ===================================

const gmail = envConfig.gmail;
const app_name: string = gmail.app_name;
const client_id: string = gmail.client_id;
const client_secret: string = gmail.client_secret;
const redirect_uri: string = gmail.redirect_uri;
//const response_type: string = gmail.response_type;// =code
//const grant_type: string = gmail.grant_type; // =authorization_code 
const scope: string = gmail.scope;
const topicName: string = gmail.webhook.topicName;

// ===================================
//set up google sdk :
// ===================================
import * as  google from 'googleapis';//google sdk for api+Oauth
import { iGmailAttachment } from '../models/iGmailAttachment';
const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
    client_id,
    client_secret,
    redirect_uri
);
// will generate a url that asks permissions for the following scopes:


export class GmailService {
    /**=================================== */
    /**Google Oauth 2.0 */
    /**=================================== */

    static consentPageUrl(): string {
        var url = oauth2Client.generateAuthUrl({
            // 'online' (default) or 'offline' (gets refresh_token)
            access_type: 'offline',
            // If you only need one scope you can pass it as a string
            scope: scope,
            // Optional property that passes state parameters to redirect URI
            // state: 'foo'
        });
        return url;
    }
    //exchange code for token
    static getToken(code: string): Promise<iGoogleToken> {
        return new Promise((resolve, reject) => {
            Logger.d(TAG, `** exchanging [Google] code for token **`, 'gray');
            oauth2Client.getToken(code, (err, token: iGoogleToken, response) => {
                this.handleResponse(err, response, token, resolve, reject);
            });
        })
    }
    /**=================================== */
    /**Gmail Webhook */
    /**=================================== */


    /**hook to user activities - get user push notifications (equivalent to Outlook - CreateSubscription)
  * https://developers.google.com/gmail/api/v1/reference/users/watch
  *   NOTE - if you are getting an 403 it maybe because of the following:
   * you didnt enabled the [Google Cloud Pub/Sub API] OR the [Gmail API]  in the google console https://console.developers.google.com/apis/library
   * you didnt provided the scope premissions when authorazing with Oauth2.0: 'https://www.googleapis.com/auth/pubsub' , .... (look in :https://developers.google.com/gmail/api/v1/reference/users/watch)
   *you didnt grant publish priviliges to serviceAccount:gmail-api-push@system.gserviceaccount.com in the  IAM:
       https://developers.google.com/gmail/api/guides/push#grant_publish_rights_on_your_topic , https://console.cloud.google.com/iam-admin/iam  
   *the topicName you are trying to register to is deleted/mismatch
       */
      static createWebhookWatch(access_token: string,userId:string='me'): Promise<iWatchResponse> {
        return new Promise((resolve, reject) => {
            let url = `https://www.googleapis.com/gmail/v1/users/${userId}/watch`;
            Logger.d(TAG, `*** creating subscription for user access token ${access_token.slice(0, 15)}.. , url >${url} ***`, 'gray');
            const body: iSubscriptionRequest = {
                topicName: topicName, //to witch topic to publish the notifications https://console.cloud.google.com/cloudpubsub
                //send notification only about sent emails - Currently not working (Bug in GMAIL API):
                labelIds: ["SENT"],
                labelFilterAction: 'include'
            }
            request.post(url, {
                json: true,
                headers: {
                    Authorization: 'Bearer ' + access_token
                },
                body: body
            }, (err, res, subscription: iWatchResponse) => {
                this.handleResponse(err, res, subscription, resolve, reject);
            });
        })
    }
    /**stop reciving notifications for that user : https://developers.google.com/gmail/api/v1/reference/users/stop */
    //(equivalent to Outlook - Stop/Delte Subscription)
    static deleteWebhookWatch(access_token: string): Promise<{}> {
        return new Promise((resolve, reject) => {

            let url = `https://www.googleapis.com/gmail/v1/users/${'me'}/stop`;
            let headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${access_token}`
            }
            Logger.d(TAG, `*** deleting watch for user [GMAIL] activities ,access token ${access_token.slice(0, 15)} , url >${url} ***`, 'gray');
            request.post({
                url: url,
                json: true,
                headers: headers,
            }, (err, res, body: {}) => {
                this.handleResponse(err, res, body, resolve, reject);
            });
        })
    }
    /**=================================== */
    /**Gmail REST API */
    /**=================================== */



    /**
   * in order to get activity details we need to send GET HistoryList Request that contains:
   * ===|URL-PARAMS
   * 1.userId/'me' that we intersted to get the history about (= we will use the 'me' value)
   * ===|Query-Params 
   * 2.@param startHistoryId - [REQUIERD] will return history records after the specified startHistoryId   
   * 3.@param pageToken - Page token to retrieve a specific page of results in the list,when we'll recive the HistoryList we'll also get:
       a.nextPageToken - that indicates that not all activites has been recivied and to get the next chunk of history
       we should use this 'nextPageToken' and send it as a @param pageToken as a queryparam
       if nextPageToken doesnt exist it means we got all activities.
       b.[RELEVANT TO GDRIVE ] *newStartPageToken - indicates the moment (the begin point) from which we want to get the activities next time a push notification happends
    
                                            */
    static handleNotification(access_token: string, startHistoryId: string, pageToken?: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                let historyChunk: iGmailHistory;
                let historyId: string = startHistoryId;
                let historyFregmentIndex = 0;//historyFregment = historyChunk.history[i]

                historyChunk = await this.getHistoryDetails(access_token, historyId, pageToken);
                if (historyChunk && historyChunk.history) {//is response contain history details
                    Logger.st(TAG, `History Chunk for HistoryId = [${historyId}] | pageToken[${pageToken ? pageToken : 'firstPage'}]`, 'yellow');
                    Logger.d(TAG, `chunk details :`);
                    console.log(JSON.stringify(historyChunk.history));
                    for (let historyFregment of historyChunk.history) {
                        Logger.d(TAG, `|------- History Fregement [${++historyFregmentIndex}]  -------|`, 'cyan');
                        Logger.d(TAG, `Fregment Details: ${JSON.stringify(historyFregment.messages)}`, 'cyan');
                        for (let message of historyFregment.messages) {
                            try {
                                let m: iGmailMessage = await GmailService.getMessageById(access_token, message.id);
                                Logger.d(TAG, `|--- Message ${message.id} Details : ---|`, 'magenta');
                                console.log(JSON.stringify(m));
                                if (GmailService.messageIsSent(m)) {//= its an email 'sent' notification (not 'DRAFT' or others)
                                    let messagePayload = m.payload;
                                    let attachmentsId: string[] = GmailService.getAttachmentsId(messagePayload);
                                    attachmentsId.length !== 0 ? Logger.d(TAG, `This Message [Contain ${attachmentsId.length} ATTACHMENTS!] , AttachmentsId = ${attachmentsId}`, 'magenta') : Logger.d(TAG, `This Message [DOESN'T Contain ATTACHMENTS]`, 'magenta')
                                    for (let attachmentId of attachmentsId) {
                                        let attachment: iGmailAttachment = await GmailService.getMessageAttachmentById(access_token, message.id, attachmentId);
                                        Logger.d(TAG,`Attachment [${attachmentId}] info`,'bgGreen');
                                        Logger.d(TAG,JSON.stringify(attachment),'bgGreen');
                                    }
                                }

                            }
                            catch (e) {
                                Logger.d(TAG, `Error while analayzing Message >>>>>>  : ` + e, 'red');

                            }
                            finally {
                                Logger.d(TAG, `** /END analayzing message  ${message.id}  **`, 'magenta');
                                Logger.d(TAG, `moving to the next message`);
                            }
                        }
                    }
                    Logger.st(TAG, `END / History Chunk for HistoryId = [${historyId}] | pageToken[${pageToken ? pageToken : 'firstPage'}] `, 'yellow');
                    console.log('\n');
                }
                else { Logger.d(TAG, 'there are no more info for that history List'); }
                //after handled that chunk - checking if their is more chunks to handle
                if (historyChunk.nextPageToken) {
                    Logger.d(TAG, `NextPageToken exist (=${historyChunk.nextPageToken}) - there are more History Chunks to pull`, 'yellow');
                    this.handleNotification(access_token, historyId, historyChunk.nextPageToken);
                }
                Logger.d(TAG, `NextPageToken Doesnt Exist - Finished pulling History Chunks , Next HistoryId ${historyChunk.historyId}`, 'yellow');
                resolve(historyChunk.historyId);
            }
            catch (e) {
                reject(e);
            }
        });
    }

    static getHistoryDetails(access_token: string, startHistoryId: string, nextPageToken?: string): Promise<iGmailHistory> {
        return new Promise((resolve, reject) => {
            /**optinal query params */
            let historyTypes: string; /*[OPTIONAL] - History types to be returned by the function           
                                            Acceptable values are:
                                            "labelAdded" - 	Labels added to messages
                                            "labelRemoved"
                                            "messageAdded"- Messages added to the mailbox 
                                            "messageDeleted" - Messages deleted (not Trashed) from the mailbox*/
            let labelId: string; //Only return messages with a label matching the ID
            let pageToken: string = nextPageToken ? `&pageToken=${nextPageToken}` : '';

            let url = `https://www.googleapis.com/gmail/v1/users/${'me'}/history?` + `startHistoryId=${startHistoryId}` + pageToken;
            let headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${access_token}`
            }
            Logger.d(TAG, `*** Getting User Gmail History of Activities , AccessToken = ${access_token.slice(0, 10)} , url >${url} ***`, 'gray');
            request.get({
                url: url,
                json: true,
                headers: headers,
            }, (err, res, body: iGmailHistory) => {
                this.handleResponse(err, res, body, resolve, reject);
            });
        })
    }
    static getMessageById(access_token: string, message_id: string): Promise<iGmailMessage> {
        return new Promise((resolve, reject) => {

            let format: string; /*[OPTINAL]
                                    Acceptable values are:
                            "full": Returns the full email message data with body content parsed in the payload field; the raw field is not used. (default)
                            "metadata": Returns only email message ID, labels, and email headers.
                            "minimal": Returns only email message ID and labels; does not return the email headers, body, or payload.
                            "raw": Returns the full email message data with body content in the raw field as a base64url encoded string; the payload field is not used.
        */
            let url = `https://www.googleapis.com/gmail/v1/users/${'me'}/messages/${message_id}`;
            let headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${access_token}`
            }
            Logger.d(TAG, `*** Getting [Gmail] Message [${message_id}] , url >${url} ***`, 'gray');
            request.get({
                url: url,
                json: true,
                headers: headers,
            }, (err, res, body: {}) => {
                this.handleResponse(err, res, body, resolve, reject);
            })
        });
    }
    static getMessageAttachments(access_token: string, message_id: string): Promise<any> {
        return new Promise((resolve, reject) => {

            let url = `https://www.googleapis.com/gmail/v1/users/${'me'}/messages/${message_id}/attachments`;
            let headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${access_token}`
            }
            Logger.d(TAG, `*** Getting [Message Attachments] MessageId ${message_id} , url >${url} ***`, 'gray');
            request.get({
                url: url,
                json: true,
                headers: headers,
            }, (err, res, body) => {
                this.handleResponse(err, res, body, resolve, reject);
            });
        })
    }
    //https://developers.google.com/gmail/api/v1/reference/users/messages/attachments/get
    static getMessageAttachmentById(access_token: string, message_id: string, attachment_id: string): Promise<iGmailAttachment> {
        return new Promise((resolve, reject) => {

            let url = `https://www.googleapis.com/gmail/v1/users/${'me'}/messages/${message_id}/attachments/${attachment_id}`;
            let headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${access_token}`
            }
            Logger.d(TAG, `*** Getting [Message Attachment] ID:[${attachment_id}] ,MessageId: ${message_id} ***`, 'gray');
            request.get({
                url: url,
                json: true,
                headers: headers,
            }, (err, res, body) => {
                this.handleResponse(err, res, body, resolve, reject);
            });
        })
    }
    /**=================================== */
    /**Private Methods */
    /**=================================== */



    /**gmail api contian messages that each can applied to many labels : DRAFT/SENT etc..
     * we only intersting about notifications of emails that are get [SENT] to someone
     * so we need to check that the notification contain the label [SENT]
     */
    private static messageIsSent(message: iGmailMessage): boolean {
        return message.labelIds.some(label => label === 'SENT');
    }

    /**check gmail message payload recursivly - and return attachmentsId's (if exist)  */
    private static getAttachmentsId(payload: iGmailMessagePayload): string[] {
        let attachmentsId: string[] = [];
        if (payload.filename//Only present if this message part represents an attachment 
            && payload.body && payload.body.attachmentId) { //TODO check if the attachment is in the currect format
            attachmentsId.push(payload.body.attachmentId);
        }
        if (payload.parts) { //if its a nested payload - check for attachments inside
            payload.parts.forEach(nestedPayload => {
                let nestedAttachmentsId: string[] = GmailService.getAttachmentsId(nestedPayload);
                attachmentsId = attachmentsId.concat(nestedAttachmentsId)
            });
        }
        return attachmentsId;
    }
    private static handleResponse(err, res, body, resolve, reject) {
        if (!res) {
            Logger.d(TAG, 'ERR ==========>server is Probably Down !', 'red');
            return reject(502);
        }
        if (err) {
            Logger.d(TAG, `ERR ==========>${err}`, 'red');
            return reject(err);
        }
        if (res.statusCode > 204) {
            Logger.d(TAG, `ERR ==========>${res.statusCode}${JSON.stringify(body)}`, 'red');
            return reject(res.statusCode);
        }
        resolve(body);
    }
    private static printHistoryChunk(historyChunk: iGmailHistory, historyId: string) {
        Logger.st(TAG, `History Chunk for HistoryId = ${historyId}`, 'yellow');
        console.log(historyChunk.history);
        historyChunk.history.forEach((historyFregment, i) => {
            console.log(`-----History Fregment ${i}`);
            console.log('Messages :');
        })
        historyChunk.nextPageToken ? Logger.d(TAG, `NextPageToken exist (=${historyChunk.nextPageToken}) - there are more History details to pull`, 'yellow')
            : Logger.d(TAG, `NextPageToken Doesnt Exist - Finished pulling History details , Next HistoryId ${historyChunk.historyId}`, 'yellow')
    }
}

//generate timestamp data of 3 days from now
function generateExpDate(): number {
    const THREE_DAYS = 1000 * 60 * 60 * 24 * 3;
    const exp_date = Date.now() + THREE_DAYS;
    return exp_date;
}