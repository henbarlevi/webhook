import * as express from 'express';
import * as fs from 'fs';
import * as Rx from 'rxjs';
import * as path from 'path';
import { GmailService } from '../services/gmail';
// ===== Models =====
import { iGoogleToken, iGmailNotification, iGmailNotificationData, iGmailChangesResponse, iGmailWebSubResponse } from '../models';
// ===== DB =====
import { UserRepository, iUserDB } from '../db/repository/userRep'
// ===== UTILS =====
import { Logger } from '../utils/Logger'
const TAG: string = 'GmailRoutes';
const router: express.Router = express.Router();
/**
 * in order to establish Gmail webhook for your app
 * you fisrt need to go through this guidline :https://developers.google.com/gmail/api/guides/push
 * which includes the pub/sub setup : https://cloud.google.com/pubsub/docs/quickstart-console
 */

router.get('/', (req: express.Request, res: express.Response) => {
    res.send('welcome to server api /gmail Route');
})
/**1.Oauth
 * a.redirect to google consent page */
router.get('/auth', (req, res) => {
    let url: string = GmailService.authPageUrl();
    res.redirect(url);
})

/*1.Oauth - b.exchange code with access token
    and get user email
  2. Webhook - registering to webhook in order to get user Gdrive activities https://developers.google.com/gmail/api/guides/push
    TODO - check if this user already registered to gmail webhook - if so - there is no need to register him again unless the time expierd
  */
router.get('/code', async (req: express.Request, res) => {
    try {
        let code = req.query.code;
        //1. Oauth - b.exchange code with access token and get user email
        Logger.d(TAG, '========== 1. b.exchange code with access token and get email ==========' + code, 'green');
        Logger.d(TAG, 'code >' + code, 'gray');
        let token: iGoogleToken = await GmailService.getToken(code);
        Logger.d(TAG, 'token >' + token, 'green');
        let email: string = await GmailService.getUserEmail(token.id_token);
        Logger.d(TAG, 'user email >' + email, 'gray');
        Logger.d(TAG, '========== 2. Webhook - registering to webhook in order to get user Gmail activities ==========' + code, 'green');

        let webhookSubscription: iGmailWebSubResponse = await GmailService.registerWebhook(token.access_token, email);
        let userRep = new UserRepository();
        await userRep.updateOrCreateUserGoogleCreds(email, token);
        await userRep.udpateUserGmailWebhook(email, webhookSubscription);
        res.status(200).send('Server hooked to your gmail Activities');
    }
    catch (e) {
        Logger.d(TAG, 'Err >>>>>>>>>>>>' + e, 'red');
        res.status(400).send();
    }
})
/**getting Gmail user Activities (push notifications) */
router.post('/webhook', async (req: express.Request, res) => {
    res.status(200).send('got the message');
    try {

        Logger.d(TAG, `=================== User  Gmail Acitivity ===================`, 'cyan');
        Logger.d(TAG, `=================== User  Gmail Acitivity ===================`, 'cyan');
        Logger.d(TAG, `=================== User  Gmail Acitivity ===================`, 'cyan');

        let notification: iGmailNotification = req.body;
        Logger.d(TAG, JSON.stringify(req.body), 'cyan');
        // decrypt from base64:
        let notificationData: iGmailNotificationData = JSON.parse(Buffer.from(notification.message.data, 'base64').toString('ascii'));
        //get details about the pushed notification:
        let userRep = new UserRepository();
        let userDoc: iUserDB = await userRep.getUserByGoogleEmail(notificationData.emailAddress);
        let access_token: string = userDoc.google.tokens.access_token;
        let historyId: string = userDoc.google.gmail.webhook.historyId;
        if (!historyId) {//if user in db doestn contain historyId
            //use the historyId in the
            historyId = notificationData.historyId;
        }
        if (userDoc.google.tokens.access_token) {
            //let changesDetails: iGmailChangesResponse = await GmailService.getChanges(access_token, notificationData.emailAddress, historyId);         
            let changesDetails: iGmailChangesResponse = await GmailService.handleNotification(access_token, notificationData.emailAddress, historyId);
            //save the historyId in db (for the next notificaiton for this user in the future) :
            await userRep.updateUserGmailHistoryId(notificationData.emailAddress, changesDetails.historyId)
        }


    }
    catch (e) {
        Logger.d(TAG, 'Err >>>>>>>>>>>>' + e, 'red');
    }
    finally {
        Logger.d(TAG, `=================== / User  Gmail Acitivity ===================`, 'cyan');
        Logger.d(TAG, `=================== / User  Gmail Acitivity ===================`, 'cyan');
        Logger.d(TAG, `=================== / User  Gmail Acitivity ===================`, 'cyan');

    }



})

export default router;


//-------------------------------------SNIPPETS-------------------------

//CONVERTING NODE FS callback to REACTIVE
// fs.readdir('./dist/routes',(err,items)=>{
//     if(err){
//         console.log(err);
//     }
//     else{
//         console.log(items);
//     }
// })
// //converting node callback function to reactive version:
// const readdir$ = Rx.Observable.bindNodeCallback(fs.readdir); //save it as a function
// readdir$('./dist/routes').subscribe(items=>{console.log(items)}); 

