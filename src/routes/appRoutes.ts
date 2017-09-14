import * as express from 'express';
import * as fs from 'fs';
import * as Rx from 'rxjs';
import * as path from 'path';
import { GdriveService } from '../services/gdrive';
// ===== Models =====
import { iGoogleToken } from '../models/iGoogleToken.model';
import { iWebSubResponse } from '../models/iWebSubResponse.model';

// ===== UTILS =====
import { Logger } from '../utils/Logger'
const TAG: string = 'AppRoutes';
const router: express.Router = express.Router();


import { user, iUserDB } from '../db/repository/fakeUser'; //just for example , instead of using a DB we just saving user details here
let dbUser = user;
router.get('/', (req: express.Request, res: express.Response) => {
    res.send('welcome to server api');
})
/**1.Oauth
 * a.redirect to google consent page */
router.get('/gdrive/auth', (req, res) => {
    let url: string = GdriveService.authPageUrl();
    res.redirect(url);
})
/*1.Oauth - b.exchange code with access token
    and get user email
  2. Webhook - registering to webhook in order to get user Gdrive activities
  NOTE - IN google You need to verify domain ownership (in the console.developers.google.com ) to allow webhook  
  NOTE - local server cannot register to webhook

  */
router.get('/gdrive/code', async (req: express.Request, res) => {
    try {
        let code = req.query.code;
        //1. Oauth - b.exchange code with access token and get user email
        Logger.d(TAG, '========== 1. b.exchange code with access token and get email ==========' + code, 'green');
        Logger.d(TAG, 'code >' + code, 'gray');
        let token: iGoogleToken = await GdriveService.getToken(code);
        Logger.d(TAG, 'token >' + token, 'green');
        let email: string = await GdriveService.getUserEmail(token.id_token);
        Logger.d(TAG, 'user email >' + email, 'gray');

        //2. Webhook - registering to webhook in order to get user Gdrive activities
        Logger.d(TAG, '========== 2. Webhook - registering to webhook in order to get user Gdrive activities ==========' + code, 'green');
        let subscription: iWebSubResponse = await GdriveService.registerWebhook(token.access_token, email);
        //*saving to db
        dbUser = {
            gdrive: {

                email: email,
                tokens: {
                    access_token: token.access_token,
                    id_token: token.id_token,
                    refresh_token: token.refresh_token,
                    token_type: token.token_type,
                    expiry_date: token.expiry_date
                },
                webhook: {
                    id: subscription.id,
                    resourceId: subscription.resourceId,//uuid = channelId
                    resourceUri: subscription.resourceUri,
                    token: subscription.token,//hen@probot.ai
                    expiration: subscription.expiration,
                }
            }
        }
        Logger.d(TAG, 'server is hooked to user ' + email + 'Activities', 'green');

    }
    catch (e) {
        Logger.d(TAG, 'Err >>>>>>>>>>>>' + e, 'red');
    }
})
/*Domain Verification -IN google in order to use webhook we should verify domain ownership
by specifing a route that will return an html downloaded from google*/
router.get('/google6415f016f1a68134.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/google6415f016f1a68134.html'));
})

/**3.hook to user activities - google will inform to this route all the activities of the user */
router.post('/webhook/gdrive', async (req: express.Request, res) => {
    Logger.d(TAG, '=================== User Gdrive Acitivity ===================', 'cyan');
    console.log(req.body);

    const channelId: string = req.headers['x-goog-channel-id'];
    const channelToken: string = req.headers['x-goog-channel-token'];
    const channelExpTime: string = req.headers['x-goog-channel-expiration'];
    const channelMsgNum: string = req.headers['x-goog-message-number'];
    // vals : sync, add , remove , update , trash , untrash ,change
    const channelResState: string = req.headers['x-goog-resource-state'];
    Logger.d(TAG, 'channelId = ' + channelId);
    Logger.d(TAG, '=== gdrive webhook notification == : ' + JSON.stringify(req.headers));
    if (channelResState == 'sync') {
        /* After creating a new notification channel to watch a resource, the Drive API sends a sync message to indicate that
           notifications are starting */
        Logger.d(TAG, '** Sending 200 to Google sync call **');
        res.status(200).end();
    } else {
        /**
         * process change - this route get notification push every time user does an activity
         * without the activity details
         * in order to get activity details send request to google that contains:
         * 1..the channelId (that indicate on which user we want to get activity details)
           2.the moment (the begin point) from which we want to get the activities that happend (=pageToken)
             a.if we dont have pageToken (first time ) we'll send request to get one 
           3.when we'll recive the changes~activities we'll also get:
             a.nextPageToken - optional - that indicates that not all activites has been recivied and to get the next chunk of activities
             we should use this 'nextPageToken'.
             if nextPageToken doesnt exist it means we got all activities.
             b.newStartPageToken - indicates the moment (the begin point) from which we want to get the activities next time a push notification happends
             (/webhook/gdrive)                                    
                                                  */
        Logger.d(TAG, '** Proccessing Activities **');
        let pageToken = dbUser.gdrive.webhook.pageToken;
        if (!pageToken) {
            Logger.d(TAG, '** doesnt have pageToken for that user - creating StartpageToken ');
            let pageToken = await GdriveService.getStartPageToken(user.gdrive.tokens.access_token); //in real app we should pull access token by channel id  - but here we just doing it on one user
            pageToken = pageToken;
        }
        let nextPageToken: string = await GdriveService.getChanges(channelId,
                                                                    user.gdrive.tokens.access_token
                                                                    , pageToken); //in real app we should pull access token by channel id  - but here we just doing it on one user,
        dbUser.gdrive.webhook.pageToken = nextPageToken;
        // res.status(httpCodes.OK).end();
    }
    Logger.d(TAG, '=================== / User Gdrive Acitivity ===================', 'cyan');

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

