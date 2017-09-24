import * as express from 'express';
import * as fs from 'fs';
import * as Rx from 'rxjs';
import * as path from 'path';
import { GmailService } from '../services/gmail';
// ===== Models =====
import { iGoogleToken, iGmailNotification, iGmailNotificationData } from '../models';
// ===== DB =====
import { UserRepository, iUserDB } from '../db/repository/userRep'
// ===== UTILS =====
import { Logger } from '../utils/Logger'
const TAG: string = 'AppRoutes';
const router: express.Router = express.Router();


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
        
        await GmailService.registerWebhook(token.access_token, email);
        let userRep = new UserRepository();
        await userRep.updateOrCreateUserGoogleCreds(email, token)
        res.status(200).send('Server hooked to your gmail Activities');
    }
    catch (e) {
        Logger.d(TAG, 'Err >>>>>>>>>>>>' + e, 'red');
    }
})
/**getting Gmail user Activities (push notifications) */
router.post('/webhook', async (req: express.Request, res) => {
    try {

        Logger.d(TAG, `=================== User  Gmail Acitivity ===================`, 'cyan');
        Logger.d(TAG, `=================== User  Gmail Acitivity ===================`, 'cyan');
        Logger.d(TAG, `=================== User  Gmail Acitivity ===================`, 'cyan');
        
        let notification: iGmailNotification = req.body;
        Logger.d(TAG, JSON.stringify(req.body), 'cyan');
        let notificationData: iGmailNotificationData = JSON.parse(Buffer.from(notification.message.data, 'base64').toString('ascii')); // decrypt from base64
        //get details about the pushed notification:
        let userRep = new UserRepository();
        let userDoc: iUserDB = await userRep.getUserByGoogleEmail(notificationData.emailAddress);
        let access_token :string = userDoc.google.tokens.access_token;
        if(userDoc.google.tokens.access_token){
          let changesDetails =  await GmailService.getChanges(access_token,notificationData.emailAddress,notificationData.historyId);
        }
        Logger.d(TAG, `=================== / User  Gmail Acitivity ===================`, 'cyan');
        Logger.d(TAG, `=================== / User  Gmail Acitivity ===================`, 'cyan');
        Logger.d(TAG, `=================== / User  Gmail Acitivity ===================`, 'cyan');
        

    }
    catch (e) {
        Logger.d(TAG, 'Err >>>>>>>>>>>>' + e, 'red');
    }
    finally {
        res.status(200).send('got the message');
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

