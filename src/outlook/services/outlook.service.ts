
import * as config from 'config';
import * as request from 'request';
// ====== utils
import { Logger } from '../../utils/Logger';
import { iMicrosoftToken } from '../models/iOauthToken.model';
import { iSubscriptionResponse } from '../models/iSubscriptionResponse.model';
import { iOutlookMessage } from '../models/iOutlookMessage.mdel';
import { iOutlookAttachmentResponse } from '../models/iOutlookAttachment.model';
const TAG: string = 'OutlookService |';

//setting outlook app creds
const ENV: string = process.env.NODE_ENV || 'local';
const envConfig: any = config.get(ENV);

const outlook = envConfig.outlook;
const app_name: string = outlook.app_name;
const client_id: string = outlook.client_id;
const client_secret: string = outlook.client_secret;
const redirect_uri: string = outlook.redirect_uri;
const response_type: string = outlook.response_type;// =code
const grant_type: string = outlook.grant_type; // =authorization_code 
const scope: string = outlook.scope;
const notification_url: string = outlook.webhook.notification_url;

export class OutlookService {
    /**=================================== */
    /**Oauth 2.0 */
    /**=================================== */

    //https://docs.microsoft.com/en-us/outlook/rest/get-started
    static consentPageUrl(): string {
        return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=${response_type}&scope=openid+Mail.Read`
    }
    //exchange code for token
    static getToken(code: string): Promise<iMicrosoftToken> {
        return new Promise((resolve, reject) => {
            Logger.d(TAG,`** exechanging code for token **`,'gray');
            let url = `https://login.microsoftonline.com/common/oauth2/v2.0/token` //?client_id=${client_id}&client_secret=${client_secret}&code=${code}&redirect_uri=${redirect_uri}`

            // request with "Content-Type":'application/x-www-form-urlencoded' : https://stackoverflow.com/questions/35473265/how-to-post-data-in-node-js-with-content-type-application-x-www-form-urlencode
            let headers = {
                "Content-Type": "application/x-www-form-urlencoded",
            }
            request.post({
                url: url,
                json: true,
                headers: headers,
                form: {
                    code: code,
                    client_id: client_id,
                    client_secret: client_secret,
                    redirect_uri: redirect_uri,
                    grant_type: "authorization_code"
                }
            }, (err, res, body) => {
                this.handleResponse(err, res, body, resolve, reject);
            });
        })
    }
    /**=================================== */
    /**Webhook */
    /**=================================== */


    /**Webhook */ /**https://msdn.microsoft.com/en-us/office/office365/api/notify-rest-operations#ChangeType */

    //create sub
    static createWebhookSubscription(access_token: string): Promise<iSubscriptionResponse> {
        return new Promise((resolve, reject) => {
            Logger.d(TAG,`*** creating subscription for user access token ${access_token.slice(0,15)}.. ***`,'gray');
            let url = `https://outlook.office.com/api/v2.0/me/subscriptions`;
            let headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${access_token}`
            }
            let ChangeType = "Created"; //	Indicates the type of events that will raise a notification- https://msdn.microsoft.com/en-us/office/office365/api/notify-rest-operations#changetype
            //let ClientState = '';//[Optional]  property that will be sent back in each notification event from microsoft graph (in the headers) (can be used to validate the notification legitimacy)
            let NotificationURL = notification_url;   //Specifies where notifications should be sent to (my resource)
            let odataType = "#Microsoft.OutlookServices.PushSubscription";
            //TODO - use Resource that will rasie notification only when attachments exists (using $filter)
            let Resource = "https://outlook.office.com/api/v2.0/me/messages";//Specifies the resource to monitor and receive notifications on (outlook/calander/onedrive/ etc..). (for example - https://outlook.office.com/api/v2.0/me/events -this for calander events) 
            request.post({
                url: url,
                json: true,
                headers: headers,
                body: {
                    "@odata.type": odataType,
                    Resource : Resource,
                    NotificationURL: NotificationURL ,
                    ChangeType : ChangeType ,
                }
            }, (err, res, body) => {
                this.handleResponse(err, res, body, resolve, reject);
            });
        })
    }
    //https://msdn.microsoft.com/en-us/office/office365/api/notify-rest-operations#delete-subscription
    static deleteWebhookSubscription(access_token: string, subscriptionId: string): Promise<iSubscriptionResponse> {
        return new Promise((resolve, reject) => {
            
            let url = `https://outlook.office.com/api/v2.0/me/subscriptions('${subscriptionId}')`;
            let headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${access_token}`
            }
            Logger.d(TAG,`*** deleting subscription for user access token ${access_token.slice(0,15)} , url >${url} ***`,'gray');
            request.delete({
                url: url,
                json: true,
                headers: headers,
            }, (err, res, body) => {
                this.handleResponse(err, res, body, resolve, reject);
            });
        })
    }
     /**=================================== */
    /**Outlook Mail REST API */
    /**=================================== */
    static getMessageById(access_token: string, message_id: string): Promise<iOutlookMessage> {
        return new Promise((resolve, reject) => {
            
            let url = `https://outlook.office.com/api/v2.0/me/messages/${message_id}`;
            let headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${access_token}`
            }
            Logger.d(TAG,`*** Getting Message Id ${message_id} , url >${url} ***`,'gray');
            request.get({
                url: url,
                json: true,
                headers: headers,
            }, (err, res, body) => {
                this.handleResponse(err, res, body, resolve, reject);
            });
        })
    }
    static getMessageAttachments(access_token: string, message_id: string): Promise<iOutlookAttachmentResponse> {
        return new Promise((resolve, reject) => {
            
            let url = `https://outlook.office.com/api/v2.0/me/messages/${message_id}/attachments`;
            let headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${access_token}`
            }
            Logger.d(TAG,`*** Getting [Message Attachments] MessageId ${message_id} , url >${url} ***`,'gray');
            request.get({
                url: url,
                json: true,
                headers: headers,
            }, (err, res, body) => {
                this.handleResponse(err, res, body, resolve, reject);
            });
        })
    }
    /**======= Private Methods ======= */
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
}

//generate timestamp data of 3 days from now
function generateExpDate(): number {
    const THREE_DAYS = 1000 * 60 * 60 * 24 * 3;
    const exp_date = Date.now() + THREE_DAYS;
    return exp_date;
}