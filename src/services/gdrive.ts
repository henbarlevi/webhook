import * as config from 'config';
import * as  google from 'googleapis';
const plus = google.plus('v1');
import * as request from 'request';
// import * as httpCodes from 'http-status-codes';
import * as uuid from 'uuid';
//const googleAuth = require('google-auth-library');

// === MODELS ===
import { iGoogleCreds } from '../models/iGoogleCreds.model';
import { iGoogleToken } from '../models/iGoogleToken.model';
import { iWebSubResponse } from '../models/iWebSubResponse.model';

// import { Token, fromGoogleToken, GoogleToken } from '../models/Token';
// import { User } from '../models/User';
// import { accountNumberFromType, AccountType } from '../models/AccountType';
// import { WebSubResponse } from '../models/gdrive/WebSubResponse';
import { iChangesResponse } from '../models/iChangesResponse.model';
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
Logger.d(TAG, '================ Google drive Config ===============', 'yellow');
Logger.d(TAG, JSON.stringify(creds), 'yellow');
Logger.d(TAG, 'Server BASE URL > ' + BASE_URL, 'yellow');

Logger.d(TAG, '================ / Google drive Config ===============', 'yellow');

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
    /**hook to user activities - get user push notifications */
    static registerWebhook(access_token: string, user_email: string): Promise<iWebSubResponse> {
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
            //https://developers.google.com/drive/v2/reference/changes/watch
            request.post('https://www.googleapis.com/drive/v2/changes/watch', {
                json: true,
                headers: {
                    Authorization: 'Bearer ' + access_token
                },
                body: req_body
            }, (err, res, subscription: iWebSubResponse) => {
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

                    console.log('body');
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
}



export function getToken(email: string): Promise<string> {
    return new Promise((resolve, reject) => {
        UserDb.findUser(email, accountNumberFromType('GDRIVE'))
            .then((user) => {
                Logger.dObj(TAG, 'getToken , user = ', user);
                if (user) {
                    if (Date.now() + REFRESH_TIME_GAP > user['exp_date']) {
                        Logger.d(TAG, 'refreshing gdrive token for user ' + email);

                        oauth2Client.setCredentials({
                            access_token: user['access_token'],
                            refresh_token: user['refresh_token']
                        });

                        oauth2Client.refreshAccessToken((err, token: GoogleToken) => {
                            if (err) {
                                Logger.e(TAG, 'refreshAccessToken , err = ' + err);
                                reject(err);
                            } else {
                                Logger.dObj(TAG, 'refreshAccessToken , got new token  = ', token);
                                UserDb.updateUserToken(fromGoogleToken(token), user['email'], user['account_type'])
                                    .then(() => {
                                        resolve(token.access_token);
                                    })
                                    .catch(err => {
                                        Logger.e(TAG, 'getToken , updateUserToken , err = ' + err);
                                        reject(err);
                                    })
                            }
                        });
                    } else {
                        Logger.d(TAG, 'token is still good = ' + user['access_token']);
                        resolve(user['access_token']);
                    }
                } else {
                    resolve(null);
                }
            })
            .catch(err => {
                Logger.e(TAG, 'getToken , err = ' + err);
                reject(err);
            })
    })
}


function getUserEmail(token_id: string): Promise<string> {
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

/*registering to user activities for 3 days */
export function registerWebhook(access_token: string, user_email: string) {
    const exp_date: number = generateExpDate();
    Logger.d(TAG, '=== REGISTRETING WEB HOOK FOR GDRIVE  === user_email : ' + user_email + ' exp_date : ' + exp_date);
    // this uniqueId  
    const uniqueId: string = uuid(); //generate random string
    const req_body = {
        id: uniqueId,
        token: user_email,
        expiration: exp_date,
        type: "web_hook",
        address: `${BASE_URL}/webhook/gdrive` //where the stream should go to
    };

    request.post('https://www.googleapis.com/drive/v2/changes/watch', {
        json: true,
        headers: {
            Authorization: 'Bearer ' + access_token
        },
        body: req_body
    }, (err, res, subscription: WebSubResponse) => {
        Logger.dObj(TAG, 'registerWebhook() res.status : ', res.statusCode);
        if (err || res.statusCode != 200) {
            Logger.dObj(TAG, 'registerWebhook() err : ', JSON.stringify(err));
        } else {
            Logger.dObj(TAG, 'registerWebhook() body : ', JSON.stringify(subscription));
            if (subscription.id && subscription.expiration) {
                UserDb.setSubscription(subscription.token, 5, subscription.id, subscription.expiration)
                    .then((isUpdated: boolean) => {
                        Logger.d(TAG, 'subscription updated ? ' + isUpdated);
                    })
                    .catch(err => Logger.e(TAG, 'err while trying to insert subscription to db  for email ' + user_email));
            }
        }
    });
}

export function handleNotification(channelId: string, notifState: string) {
    UserDb.findUserBySubId(channelId, 5)
        .then(user => {
            const nextPageToken: string = user['delta_link'];
            if (!nextPageToken) {
                getStartPageToken(user['access_token'])
                    .then(pageToken => {
                        getDeltaForUser(user, pageToken);
                    })
            } else {
                getDeltaForUser(user, nextPageToken);
            }
        })
        .catch(err => Logger.e(TAG, 'handleNotification err ' + err));
}

function getStartPageToken(access_token: string): Promise<string> {
    return new Promise((resolve, reject) => {
        request.get('https://www.googleapis.com/drive/v2/changes/startPageToken', {
            headers: {
                Authorization: 'Bearer ' + access_token
            },
            json: true
        }, (err, res, body: { startPageToken: string }) => {
            Logger.d(TAG, 'getStartPageToken() , status : ' + res.statusCode);
            if (err || !body) {
                Logger.e(TAG, 'getStartPageToken() , err  = ' + err);
                reject(res.statusCode);
            } else {
                Logger.d(TAG, 'getStartPageToken() , success body : ' + JSON.stringify(body));
                resolve(body.startPageToken);
            }
        });
    });
}


function getDeltaForUser(user: User, nextPageToken: string) {
    request.get('https://www.googleapis.com/drive/v2/changes?pageToken=' + nextPageToken, {
        headers: {
            Authorization: 'Bearer ' + user.access_token
        },
        json: true
    }, (err, res, body: ChangesResponse) => {
        Logger.d(TAG, 'getDeltaForUser() , status = ' + res.statusCode);
        if (err || !body) {
            Logger.e(TAG, 'getDeltaForUser() err = ' + err);
        } else {
            body.items.forEach(change => {
                // send changes to stas for proccessing
                const parentId: string = change.file.parents.length > 0 ? change.file.parents[0].id : '';
                Shieldox.reportEntityChanged(user.shieldox_bearer, change.fileId, parentId);
            });
            // fetching next page of changes for this user 
            if (body.nextPageToken) {
                getDeltaForUser(user, body.nextPageToken);
            }
            // last page token was used , saving the token for the next changes for this user
            if (body.newStartPageToken) {
                UserDb.updateDeltaLink(user.email, user.account_type, body.newStartPageToken)
                    .then(() => {
                        Logger.d(TAG, 'successfully updated user delta_link for Gdrive!');
                    })
                    .catch((err) => Logger.e(TAG, 'updateDeltaLink() , err = ' + err));
            }
        }
    });
}

function generateExpDate(): number {
    const THREE_DAYS = 1000 * 60 * 60 * 24 * 3;
    const exp_date = Date.now() + THREE_DAYS;
    return exp_date;
}