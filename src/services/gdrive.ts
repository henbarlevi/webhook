import * as config from 'config';
import * as  google from 'googleapis';
const plus = google.plus('v1');
import * as request from 'request';
// import * as httpCodes from 'http-status-codes';
import * as uuid from 'uuid';
//const googleAuth = require('google-auth-library');

// === MODELS ===
import { iGoogleCreds ,iGoogleToken,iGdriveWebSubResponse,iChangesResponse} from '../models/';


// === UTILS ===
import { Logger } from '../utils/Logger';
const TAG: string = 'Gdrive';

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
    creds.redirect_url
);
const drive = google.drive({
    version: 'v2',
    auth: oauth2Client
});
//================ / google api lib initalization ===================:


//const REFRESH_TIME_GAP: number = 10 * 60 * 1000;


//const auth = new googleAuth();
//const oauth2Client = new auth.OAuth2(creds.client_id, creds.client_secret, creds.redirect_uri);
export class GdriveService {
    /**return the google authentication page url for the app */
    static authPageUrl(): string {

        const url: string = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            response_type: 'code',
            scope: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/userinfo.email'],
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
     * https://developers.google.com/drive/v2/reference/changes/watch
    */
    static registerWebhook(access_token: string, user_email: string): Promise<iGdriveWebSubResponse> {
        return new Promise((resolve, reject) => {

            const exp_date: number = generateExpDate();
            Logger.d(TAG, '*** REGISTRETING WEB HOOK FOR GDRIVE  === user_email : ' + user_email + ' exp_date : ' + exp_date + ' access_Token :' + access_token + 'to address : ' + `${BASE_URL}/webhook/gdrive` + '***');
            // this uniqueId  
            const uniqueId: string = uuid(); //generate random string
            const req_body = {
                id: uniqueId, //channel ID
                token: user_email,
                expiration: exp_date,
                type: "web_hook",
                address: `${BASE_URL}/webhook/gdrive` //where the notifications should go to
            };
            request.post('https://www.googleapis.com/drive/v2/changes/watch', {
                json: true,
                headers: {
                    Authorization: 'Bearer ' + access_token
                },
                body: req_body
            }, (err, res, subscription: iGdriveWebSubResponse) => {
                if (err) {
                    Logger.d(TAG, 'Err >>>>>>>>>>>' + err, 'red');
                    return reject(err);
                }
                if (res.statusCode != 200) {
                    reject(JSON.stringify(subscription));
                }
                else {
                    if (subscription.id && subscription.expiration) {
                        Logger.d(TAG, 'Webhook Registeration succeded', 'green');
                        Logger.d(TAG, '============== Webhook Registered Details ============', 'green');
                        Logger.d(TAG, 'channel id :' + subscription.id, 'gray');
                        Logger.d(TAG, 'resourceId :' + subscription.resourceId, 'gray');
                        Logger.d(TAG, 'resourceUri :' + subscription.resourceUri, 'gray');
                        Logger.d(TAG, 'the user :' + subscription.token, 'gray'); //"hen@probot.ai"

                        Logger.d(TAG, '============== / Webhook Registered Details ============', 'green');

                        resolve(subscription);
                    }
                }
            });
        });
    }
    static getStartPageToken(access_token: string): Promise<string> {
        return new Promise((resolve, reject) => {
            request.get('https://www.googleapis.com/drive/v2/changes/startPageToken', {
                headers: {
                    Authorization: 'Bearer ' + access_token
                },
                json: true
            }, (err, res, body: { startPageToken: string }) => {
                if (!res) {
                    return reject();
                }
                if (res.statusCode > 204) {
                    reject(res.statusCode);

                }
                else {
                    Logger.d(TAG, 'start page Token > ' + body.startPageToken);
                    resolve(body.startPageToken);
                }
            });
        });
    }
    /**https://developers.google.com/drive/v2/reference/changes/list 
     * Get Changes Details
    */
    static getChanges(channelId: string, access_token: string, pageToken: string): Promise<string> {
        return new Promise((resolve, reject) => {
            Logger.d(TAG, ` ** Getting user Changes , channelID ${channelId} , access Token : ${access_token}, page Token : ${pageToken}`)
            request.get('https://www.googleapis.com/drive/v2/changes?pageToken=' + pageToken, {
                headers: {
                    Authorization: 'Bearer ' + access_token
                },
                json: true
            }, (err, res, body: iChangesResponse) => {
                if (err || !body) {
                    Logger.d(TAG, 'ERR >>>>>>>>  ' + err);
                } else {
                    // body.items.forEach((change,index) => { //items =changes
                    //     Logger.d(TAG,`CHANGE ${index} >`);
                    //     console.log(change);

                    // });
                    Logger.d(TAG, '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
                    Logger.d(TAG, `^^^^^^^^^^^   CHANNEL ${channelId}    CHANGES      ^^^^^^^^^`);
                    Logger.d(TAG, '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');

                    console.log(body);
                    console.log(JSON.stringify(body.items));

                    Logger.d(TAG, '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
                    Logger.d(TAG, '^^^^^^^^^^^^^^^^^^^^^   END   CHANGES      ^^^^^^^^^^^^^^^^^');
                    Logger.d(TAG, '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');

                    // fetching next page of changes for this user 
                    if (body.nextPageToken) {
                        getDeltaForUser(channelId, body.nextPageToken);
                    }
                    // last page token was used , saving the token for the next changes for this user
                    if (body.newStartPageToken) {
                        return resolve(body.newStartPageToken);
                    }
                    resolve();
                }
            });
        });

    }
    /*if we wont to shut down a notification channel
     https://developers.google.com/drive/v2/web/push#stopping-notifications */
    static stopNotifications(channelId: string, access_token: string, resourceId: string) {
        return new Promise((resolve, reject) => {
            Logger.d(TAG, ` ** Stop notifications for channel > ${channelId} , access Token : ${access_token},resource Id: ${resourceId}`)
            const body_req = {
                "id": channelId,
                "resourceId": resourceId
            }
            request.post('https://www.googleapis.com/drive/v2/channels/stop', {
                headers: {
                    Authorization: 'Bearer ' + access_token
                },
                body: body_req,
                json: true
            }, (err, res, body) => {
                if (!res) {
                    Logger.d(TAG, '- Stop Notifcations ERR >>>>>>>>>>>>>>>>>>>>>> - couldnt send request (internet maybe disconnected)', 'red');
                    return reject();
                }
                if (err || res.statusCode > 204) {
                    Logger.d(TAG, '- Stop Notifcations ERR >>>>>>>>>>>>>>>>>>>>>> ' + res.statusCode + '  -' + err, 'red');
                    return reject();
                } else {
                    Logger.d(TAG, '- Stop notifications - Channel Closed  ' + res.statusCode + '  -' + err, 'green');

                    resolve();
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