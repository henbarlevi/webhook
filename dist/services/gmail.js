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
const oauth2Client = new OAuth2(creds.client_id, creds.client_secret, creds.redirect_url_gmail);
const drive = google.drive({
    version: 'v2',
    auth: oauth2Client
});
//================ / google api lib initalization ===================:
Logger_1.Logger.d(TAG, '================ Google drive Config ===============', 'yellow');
Logger_1.Logger.d(TAG, JSON.stringify(creds), 'yellow');
Logger_1.Logger.d(TAG, 'Server BASE URL > ' + BASE_URL, 'yellow');
Logger_1.Logger.d(TAG, '================ / Google drive Config ===============', 'yellow');
//const REFRESH_TIME_GAP: number = 10 * 60 * 1000;
//const auth = new googleAuth();
//const oauth2Client = new auth.OAuth2(creds.client_id, creds.client_secret, creds.redirect_uri);
class GmailService {
    /**return the google authentication page url for the app */
    static authPageUrl() {
        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            response_type: 'code',
            scope: ['https://mail.google.com/', 'https://www.googleapis.com/auth/userinfo.email'] //['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/userinfo.email'],
            //prompt: 'consent'
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
            Logger_1.Logger.d(TAG, '*** REGISTRETING WEB HOOK FOR GMAIL  === user_email : ' + user_email + ' exp_date : ' + exp_date + ' access_Token :' + access_token + 'to address : ' + `${BASE_URL}/webhook/gdrive` + '***');
            // this uniqueId  
            const uniqueId = uuid(); //generate random string
            const req_body = {
                topicName: "projects/webhooks-179808/topics/mytopic",
                labelIds: ["INBOX"],
            };
            request.post(`https://www.googleapis.com/gmail/v1/users/${user_email}/watch`, {
                json: true,
                headers: {
                    Authorization: 'Bearer ' + access_token
                },
                body: req_body
            }, (err, res, subscription) => {
                if (!res) {
                    Logger_1.Logger.d(TAG, 'Response is empty - maybe you are not connected to the internet', 'red');
                    return reject();
                }
                if (err) {
                    Logger_1.Logger.d(TAG, 'Err >>>>>>>>>>>' + err, 'red');
                    return reject(err);
                }
                if (res.statusCode != 200) {
                    reject(JSON.stringify(subscription));
                }
                else {
                    Logger_1.Logger.d(TAG, 'Webhook Gmail Registeration succeded', 'green');
                    Logger_1.Logger.d(TAG, subscription, 'green');
                    // if (subscription.id && subscription.expiration) {
                    //     Logger.d(TAG, 'Webhook Registeration succeded', 'green');
                    //     Logger.d(TAG, '============== Webhook Registered Details ============', 'green');
                    //     Logger.d(TAG, 'channel id :' + subscription.id, 'gray');
                    //     Logger.d(TAG, 'resourceId :' + subscription.resourceId, 'gray');
                    //     Logger.d(TAG, 'resourceUri :' + subscription.resourceUri, 'gray');
                    //     Logger.d(TAG, 'the user :' + subscription.token, 'gray'); //"hen@probot.ai"
                    //     Logger.d(TAG, '============== / Webhook Registered Details ============', 'green');
                    //     resolve(subscription);
                    // }
                }
            });
        });
    }
    static getStartPageToken(access_token) {
        return new Promise((resolve, reject) => {
        });
    }
    /**https://developers.google.com/drive/v2/reference/changes/list */
    static getChanges(channelId, access_token, pageToken) {
        return new Promise((resolve, reject) => {
        });
    }
    /*if we wont to shut down a notification channel
     https://developers.google.com/drive/v2/web/push#stopping-notifications */
    static stopNotifications(channelId, access_token, resourceId) {
        return new Promise((resolve, reject) => {
        });
    }
}
exports.GmailService = GmailService;
function generateExpDate() {
    const THREE_DAYS = 1000 * 60 * 60 * 24 * 3;
    const exp_date = Date.now() + THREE_DAYS;
    return exp_date;
}
