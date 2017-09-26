import * as config from 'config';
import * as  google from 'googleapis';
const plus = google.plus('v1');
import * as request from 'request';
// import * as httpCodes from 'http-status-codes';
import * as uuid from 'uuid';
//const googleAuth = require('google-auth-library'); //alternative SDK library for 'googleapis

// === MODELS ===
import { iGoogleCreds, iGoogleToken, iGdriveWebSubResponse, iGmailChangesResponse, iGmailWebSubResponse, iGmailAttachmentData, iGmailMessage, iPayload } from '../models/';


// === UTILS ===
import { Logger } from '../utils/Logger';
const TAG: string = 'GMAIL';

//import { user as UserDb } from '../db/user';
const ENV: string = process.env.NODE_ENV || 'local';
const envConfig: any = config.get(ENV);
const creds: iGoogleCreds = <iGoogleCreds>envConfig.gdrive;
const BASE_URL: string = <string>envConfig.base_url;

//================ google api lib initalization ===================:
const urlshortener = google.urlshortener('v1');
const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
    creds.client_id,
    creds.client_secret,
    creds.redirect_url_gmail
);
const drive = google.drive({
    version: 'v2',
    auth: oauth2Client
});
//================ / google api lib initalization ===================:


//const REFRESH_TIME_GAP: number = 10 * 60 * 1000;


//const auth = new googleAuth();
//const oauth2Client = new auth.OAuth2(creds.client_id, creds.client_secret, creds.redirect_uri);
export class GmailService {
    /**return the google authentication page url for the app */
    static authPageUrl(): string {

        const url: string = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            response_type: 'code',
            scope: ['https://mail.google.com/', 'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/gmail.modify',
                'https://www.googleapis.com/auth/pubsub',
                'https://www.googleapis.com/auth/gmail.readonly',
                'https://www.googleapis.com/auth/gmail.metadata']//['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/userinfo.email'],
            //prompt: 'consent'
        });
        Logger.d(TAG, 'url generated >' + url);
        return url;

    }
    /*exchange code with token*/
    static getToken(code: string): Promise<iGoogleToken> {
        return new Promise((resolve, reject) => {
            oauth2Client.getToken(code, (err, token: iGoogleToken, response) => {
                if (err) {
                    Logger.d(TAG, 'Error while trying to retrieve access token: ' + err, 'red');
                    return reject(err);
                }
                Logger.d(TAG, 'token > ' + JSON.stringify(token), 'green')
                oauth2Client.setCredentials(token);
                resolve(token);
            });
        });
    }
    /*get user email*/
    static getUserEmail(token_id: string): Promise<string> {
        return new Promise((resolve, reject) => {
            oauth2Client.verifyIdToken(
                token_id,
                creds.client_id,
                (err, login) => {
                    if (err) {
                        reject(err);
                    } else {
                        var payload = login.getPayload();
                        const userid = payload['sub'];
                        const email = payload['email'];
                        console.log('userid : ' + userid);
                        console.log('email : ' + email);
                        resolve(email);
                    }
                });
        });
    }

    /**hook to user activities - get user push notifications 
   * https://developers.google.com/gmail/api/v1/reference/users/watch
   *   NOTE - if you are getting an 403 it maybe because of the following:
    * you didnt enable the gmail + pub/sub api for the project in the google console https://console.developers.google.com/apis/library
    * you didnt provided the scope premissions when authorazing with Oauth2.0: 'https://www.googleapis.com/auth/pubsub' , .... (look in :https://developers.google.com/gmail/api/v1/reference/users/watch)
    *you didnt grant publish priviliges to serviceAccount:gmail-api-push@system.gserviceaccount.com in the  IAM:
        https://developers.google.com/gmail/api/guides/push#grant_publish_rights_on_your_topic , https://console.cloud.google.com/iam-admin/iam  
  */
    static registerWebhook(access_token: string, user_email: string): Promise<iGmailWebSubResponse> {
        return new Promise((resolve, reject) => {

            Logger.d(TAG, '*** REGISTRETING WEB HOOK FOR GMAIL  === user_email : ' + user_email + ' access_Token :' + access_token + '***');
            const req_body = {
                topicName: "projects/webhooks-179808/topics/mytopic", //as registered when creating the topic https://console.cloud.google.com/cloudpubsub
                labelIds: [
                    "INBOX"
                ],
            }
            request.post(`https://www.googleapis.com/gmail/v1/users/${user_email}/watch`, {
                json: true,
                headers: {
                    Authorization: 'Bearer ' + access_token
                },
                body: req_body
            }, (err, res, subscription: iGmailWebSubResponse) => {
                if (!res) {
                    Logger.d(TAG, 'Response is empty - maybe you are not connected to the internet', 'red');
                    return reject();
                }
                if (err) {
                    Logger.d(TAG, 'Err >>>>>>>>>>>' + err, 'red');
                    return reject(err);
                }

                if (res.statusCode != 200) {
                    reject(JSON.stringify(subscription));
                }
                else {
                    Logger.d(TAG, 'Webhook Gmail Registeration succeded', 'green');
                    Logger.d(TAG, JSON.stringify(subscription), 'green');
                    resolve(subscription);

                }
            });
        });
    }
    /**NOT RELEVANT TO WEBHOOK - JUST CHECKING THE Oauth scope permissions is correct https://developers.google.com/gmail/api/v1/reference/users/messages/list -  
     * NOTE -Advanced search for querying only relevant messages: https://developers.google.com/gmail/api/guides/filtering
    */
    static getUserMessages(access_token: string, user_email: string): Promise<any> {
        return new Promise((resolve, reject) => {

            Logger.d(TAG, '*** GETTING USER GMAIL MESSAGES  LIST === user_email : ' + user_email + ' access_Token :' + access_token + '***');

            request.get(`https://www.googleapis.com/gmail/v1/users/${user_email}/messages`, {
                json: true,
                headers: {
                    Authorization: 'Bearer ' + access_token
                },
                //body: req_body
            }, (err, res, subscription: any) => {
                if (!res) {
                    Logger.d(TAG, 'Response is empty - maybe you are not connected to the internet', 'red');
                    return reject();
                }
                if (err) {
                    Logger.d(TAG, 'Err >>>>>>>>>>>' + err, 'red');
                    return reject(err);
                }

                if (res.statusCode != 200) {
                    reject(JSON.stringify(subscription));
                }
                else {
                    Logger.d(TAG, 'GET gmail messages list succeded', 'green');
                    Logger.d(TAG, subscription, 'green');
                }
            });
        });
    }

    static getStartPageToken(access_token: string): Promise<string> {
        return new Promise((resolve, reject) => {

        });
    }
    /*if we wont to shut down a notification channel
     https://developers.google.com/gmail/api/v1/reference/users/stop */
    static stopNotifications(access_token: string, user_email: string) {
        return new Promise((resolve, reject) => {
            Logger.d(TAG, `*** STOPING Webhhok for user : ${user_email} Details   ***`);
            request.post(`https://www.googleapis.com/gmail/v1/users/${user_email}/stop`, {
                json: true,
                headers: {
                    Authorization: 'Bearer ' + access_token
                },
                //body: req_body
            }, (err, res, body) => {
                if (!res) {
                    Logger.d(TAG, 'Response is empty - maybe you are not connected to the internet', 'red');
                    return reject();
                }
                if (err) {
                    Logger.d(TAG, 'Err >>>>>>>>>>>' + err, 'red');
                    return reject(err);
                }

                if (res.statusCode != 200) {
                    Logger.d(TAG, 'Err >>>>>>>>>>>' + res.statusCode, 'red');
                    reject(res.statusCode);
                }
                else {
                    Logger.d(TAG, `Webhook to ${user_email} has succesfully shut down`);
                    resolve();
                }
            });
        });
    }
    static handleNotification(access_token: string, user_email: string, historyId: string): Promise<iGmailChangesResponse> {
        return new Promise(async (resolve, reject) => {
            try {

                let changes: iGmailChangesResponse;
                while (!changes || changes.nextPageToken) {//get changes details until we got all of them
                    changes = await this.getChanges(access_token, user_email, historyId);
                    changes.history ? //is response contain history details
                        changes.history.forEach(historyFregment => {
                            historyFregment.messages.forEach(async message => {
                                await this.getMessageAttachments(access_token, user_email, message.id);
                            })
                        }) : Logger.d(TAG, 'there are no more info for that history List');
                }
                resolve(changes);
            }
            catch (e) {
                reject(e);
            }
        });

    }
    /**https://developers.google.com/gmail/api/v1/reference/users/history/list */
    private static getChanges(access_token: string, user_email: string, historyId: string, pageToken?: string): Promise<iGmailChangesResponse> {
        return new Promise((resolve, reject) => {
            const exp_date: number = generateExpDate();
            Logger.d(TAG, '*** GETTING USER GMAIL ACTIVITIES DETAILS (history list request)   ***');
            Logger.d(TAG, 'User Email =' + user_email);
            Logger.d(TAG, 'User Access Token =' + access_token);
            Logger.d(TAG, 'HistoryId =' + historyId);


            request.get(`https://www.googleapis.com/gmail/v1/users/${user_email}/history?` + 'startHistoryId=' + historyId, {
                json: true,
                headers: {
                    Authorization: 'Bearer ' + access_token
                },
                //body: req_body
            }, async (err, res, changes: iGmailChangesResponse) => {
                if (!res) {
                    Logger.d(TAG, 'Response is empty - maybe you are not connected to the internet', 'red');
                    return reject();
                }
                if (err) {
                    Logger.d(TAG, 'Err >>>>>>>>>>>' + err, 'red');
                    return reject(err);
                }

                if (res.statusCode != 200) {
                    Logger.d(TAG, 'Err >>>>>>>>>>>' + res.statusCode, 'red');
                    reject(res.statusCode);
                }
                else {
                    Logger.d(TAG, 'GET Gmail Changes Details  succeded', 'green');
                    Logger.d(TAG, JSON.stringify(changes), 'green');
                    resolve(changes);
                    // Logger.d(TAG, `GETTING MESSAGE DETAILS for each change >`, 'green');

                    // //changes.history.messages //TODO
                    // if (changes.nextPageToken) {
                    //     Logger.d(TAG, '**Page Token exist in response -GETTING NEXT PAGE OF Gmail Changes Details ', 'green');
                    //     let nextChanges = await this.getChanges(access_token, user_email, historyId, changes.nextPageToken)
                    //     resolve(changes);
                    // } else {

                    //     resolve(changes);
                    // }
                    // // Logger.d(TAG, changes, 'green');
                }
            });
        });

    }



    private static getMessageAttachments(access_token: string, user_email: string, message_id: string) {
        return new Promise(async (resovle, reject) => {
            try {
                Logger.d(TAG, `****** Checking if Message : ${message_id} Has Attachments   ******`);
                Logger.d(TAG, `user email = ${user_email}`);
                Logger.d(TAG, `ccess_token = ${access_token}`);
                Logger.d(TAG, `******************************************************************`);

                let gmailMessage: iGmailMessage = await this.getMessage(access_token, user_email, message_id);
                let attachments: iPayload[] = this.checkMessageForAttachments(gmailMessage);
                Logger.d(TAG, `==============  FOUND ATTACHMENTS  ==============`);
                console.log(attachments);
                console.log(JSON.stringify(attachments));
                Logger.d(TAG, `==============/  FOUND ATTACHMENTS  ==============`);
            }
            catch (e) {
                reject(e);
            }
        })
    }
    private static checkMessageForAttachments(gmailMessage: iGmailMessage): iPayload[] {
        return this.searchForAttachmentsInPayload(gmailMessage.payload);
    }
    private static searchForAttachmentsInPayload(payload: iPayload) {
        if (payload.filename != '') {
            return [payload];
        }
        if (!payload.parts) {
            return [];
        }
        let payloadsWithAttachments: iPayload[] = [];
        payload.parts.forEach((part: iPayload) => {
            payloadsWithAttachments.concat(this.searchForAttachmentsInPayload(part));
        });
        return payloadsWithAttachments;
    }
    private static getMessage(access_token: string, user_email: string, message_id: string): Promise<iGmailMessage> {
        //https://www.googleapis.com/gmail/v1/users/userId/messages/id
        return new Promise((resolve, reject) => {
            Logger.d(TAG, `*** GETTING Message : ${message_id} Details   ***`);
            request.get(`https://www.googleapis.com/gmail/v1/users/${user_email}/messages/${message_id}`, {
                json: true,
                headers: {
                    Authorization: 'Bearer ' + access_token
                },
                //body: req_body
            }, async (err, res, message: iGmailMessage) => {
                if (!res) {
                    Logger.d(TAG, 'Response is empty - maybe you are not connected to the internet', 'red');
                    return reject();
                }
                if (err) {
                    Logger.d(TAG, 'Err >>>>>>>>>>>' + err, 'red');
                    return reject(err);
                }

                if (res.statusCode != 200) {
                    Logger.d(TAG, 'Err >>>>>>>>>>>' + res.statusCode, 'red');
                    reject(res.statusCode);
                }
                else {
                    Logger.d(TAG, 'got message info ');
                    resolve(message);
                }
            });
        });
    }
    /**https://developers.google.com/gmail/api/v1/reference/users/messages/attachments/get */
    private static getAttachmentById(access_token: string, user_email: string, message_id: string, attachment_id: string) {
        //  GET https://www.googleapis.com/gmail/v1/users/userId/messages/messageId/attachments/id
        return new Promise((resolve, reject) => {
            Logger.d(TAG, '*** GETTING ATTACHMENT :' + attachment_id + ' OF MESSAGE :' + message_id + '   ***');
            request.get(`https://www.googleapis.com/gmail/v1/users/${user_email}/messages/${message_id}/attachments/${attachment_id}`, {
                json: true,
                headers: {
                    Authorization: 'Bearer ' + access_token
                },
                //body: req_body
            }, async (err, res, attachmentData: iGmailAttachmentData) => {
                if (!res) {
                    Logger.d(TAG, 'Response is empty - maybe you are not connected to the internet', 'red');
                    return reject();
                }
                if (err) {
                    Logger.d(TAG, 'Err >>>>>>>>>>>' + err, 'red');
                    return reject(err);
                }

                if (res.statusCode != 200) {
                    Logger.d(TAG, 'Err >>>>>>>>>>>' + res.statusCode, 'red');
                    reject(res.statusCode);
                }
                else {
                    Logger.d(TAG, 'Attachment DATA >' + attachmentData.data);

                }
            });
        });
    }
}



function generateExpDate(): number {
    const THREE_DAYS = 1000 * 60 * 60 * 24 * 3;
    const exp_date = Date.now() + THREE_DAYS;
    return exp_date;
}