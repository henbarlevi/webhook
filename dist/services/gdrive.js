"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = require("config");
const google = require("googleapis");
const plus = google.plus('v1');
const request = require("request");
// import * as httpCodes from 'http-status-codes';
const uuid = require("uuid");
// === UTILS ===
const Logger_1 = require("../utils/Logger");
const TAG = 'Gdrive';
//import { user as UserDb } from '../db/user';
const ENV = process.env.NODE_ENV || 'local';
const envConfig = config.get(ENV);
const creds = envConfig.gdrive;
const BASE_URL = envConfig.base_url;
//================ google api lib initalization ===================:
const urlshortener = google.urlshortener('v1');
const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(creds.client_id, creds.client_secret, creds.redirect_url);
const drive = google.drive({
    version: 'v2',
    auth: oauth2Client
});
//================ / google api lib initalization ===================:
//const REFRESH_TIME_GAP: number = 10 * 60 * 1000;
//const auth = new googleAuth();
//const oauth2Client = new auth.OAuth2(creds.client_id, creds.client_secret, creds.redirect_uri);
class GdriveService {
    /**return the google authentication page url for the app */
    static authPageUrl() {
        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            response_type: 'code',
            scope: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/userinfo.email'],
        });
        Logger_1.Logger.d(TAG, 'url generated >' + url);
        return url;
    }
    /*exchange code with token*/
    static getToken(code) {
        return new Promise((resolve, reject) => {
            oauth2Client.getToken(code, (err, token, response) => {
                if (err) {
                    Logger_1.Logger.d(TAG, 'Error while trying to retrieve access token: ' + err, 'red');
                    return reject(err);
                }
                Logger_1.Logger.d(TAG, 'token > ' + JSON.stringify(token), 'green');
                oauth2Client.setCredentials(token);
                resolve(token);
            });
        });
    }
    /*get user email*/
    static getUserEmail(token_id) {
        return new Promise((resolve, reject) => {
            oauth2Client.verifyIdToken(token_id, creds.client_id, (err, login) => {
                if (err) {
                    reject(err);
                }
                else {
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
    static registerWebhook(access_token, user_email) {
        return new Promise((resolve, reject) => {
            const exp_date = generateExpDate();
            Logger_1.Logger.d(TAG, '*** REGISTRETING WEB HOOK FOR GDRIVE  === user_email : ' + user_email + ' exp_date : ' + exp_date + ' access_Token :' + access_token + 'to address : ' + `${BASE_URL}/webhook/gdrive` + '***');
            // this uniqueId  
            const uniqueId = uuid(); //generate random string
            const req_body = {
                id: uniqueId,
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
            }, (err, res, subscription) => {
                if (err) {
                    Logger_1.Logger.d(TAG, 'Err >>>>>>>>>>>' + err, 'red');
                    return reject(err);
                }
                if (res.statusCode != 200) {
                    reject(JSON.stringify(subscription));
                }
                else {
                    if (subscription.id && subscription.expiration) {
                        Logger_1.Logger.d(TAG, 'Webhook Registeration succeded', 'green');
                        Logger_1.Logger.d(TAG, '============== Webhook Registered Details ============', 'green');
                        Logger_1.Logger.d(TAG, 'channel id :' + subscription.id, 'gray');
                        Logger_1.Logger.d(TAG, 'resourceId :' + subscription.resourceId, 'gray');
                        Logger_1.Logger.d(TAG, 'resourceUri :' + subscription.resourceUri, 'gray');
                        Logger_1.Logger.d(TAG, 'the user :' + subscription.token, 'gray'); //"hen@probot.ai"
                        Logger_1.Logger.d(TAG, '============== / Webhook Registered Details ============', 'green');
                        resolve(subscription);
                    }
                }
            });
        });
    }
    static getStartPageToken(access_token) {
        return new Promise((resolve, reject) => {
            request.get('https://www.googleapis.com/drive/v2/changes/startPageToken', {
                headers: {
                    Authorization: 'Bearer ' + access_token
                },
                json: true
            }, (err, res, body) => {
                if (!res) {
                    return reject();
                }
                if (res.statusCode > 204) {
                    reject(res.statusCode);
                }
                else {
                    Logger_1.Logger.d(TAG, 'start page Token > ' + body.startPageToken);
                    resolve(body.startPageToken);
                }
            });
        });
    }
    /**https://developers.google.com/drive/v2/reference/changes/list
     * Get Changes Details
    */
    static getChanges(channelId, access_token, pageToken) {
        return new Promise((resolve, reject) => {
            Logger_1.Logger.d(TAG, ` ** Getting user Changes , channelID ${channelId} , access Token : ${access_token}, page Token : ${pageToken}`);
            request.get('https://www.googleapis.com/drive/v2/changes?pageToken=' + pageToken, {
                headers: {
                    Authorization: 'Bearer ' + access_token
                },
                json: true
            }, (err, res, body) => {
                if (err || !body) {
                    Logger_1.Logger.d(TAG, 'ERR >>>>>>>>  ' + err);
                }
                else {
                    // body.items.forEach((change,index) => { //items =changes
                    //     Logger.d(TAG,`CHANGE ${index} >`);
                    //     console.log(change);
                    // });
                    Logger_1.Logger.d(TAG, '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
                    Logger_1.Logger.d(TAG, `^^^^^^^^^^^   CHANNEL ${channelId}    CHANGES      ^^^^^^^^^`);
                    Logger_1.Logger.d(TAG, '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
                    console.log(body);
                    console.log(JSON.stringify(body.items));
                    Logger_1.Logger.d(TAG, '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
                    Logger_1.Logger.d(TAG, '^^^^^^^^^^^^^^^^^^^^^   END   CHANGES      ^^^^^^^^^^^^^^^^^');
                    Logger_1.Logger.d(TAG, '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
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
    static stopNotifications(channelId, access_token, resourceId) {
        return new Promise((resolve, reject) => {
            Logger_1.Logger.d(TAG, ` ** Stop notifications for channel > ${channelId} , access Token : ${access_token},resource Id: ${resourceId}`);
            const body_req = {
                "id": channelId,
                "resourceId": resourceId
            };
            request.post('https://www.googleapis.com/drive/v2/channels/stop', {
                headers: {
                    Authorization: 'Bearer ' + access_token
                },
                body: body_req,
                json: true
            }, (err, res, body) => {
                if (!res) {
                    Logger_1.Logger.d(TAG, '- Stop Notifcations ERR >>>>>>>>>>>>>>>>>>>>>> - couldnt send request (internet maybe disconnected)', 'red');
                    return reject();
                }
                if (err || res.statusCode > 204) {
                    Logger_1.Logger.d(TAG, '- Stop Notifcations ERR >>>>>>>>>>>>>>>>>>>>>> ' + res.statusCode + '  -' + err, 'red');
                    return reject();
                }
                else {
                    Logger_1.Logger.d(TAG, '- Stop notifications - Channel Closed  ' + res.statusCode + '  -' + err, 'green');
                    resolve();
                }
            });
        });
    }
}
exports.GdriveService = GdriveService;
function generateExpDate() {
    const THREE_DAYS = 1000 * 60 * 60 * 24 * 3;
    const exp_date = Date.now() + THREE_DAYS;
    return exp_date;
}
