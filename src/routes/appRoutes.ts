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


let user: any = {}; //just for example , instead of using a DB we just saving user details here

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
        let subscription : iWebSubResponse = await GdriveService.registerWebhook(token.access_token, email);
        //saving to db
        user.gdrive = {
            email: email,
            tokens: {
                access_token: token.access_token,
                id_token: token.id_token,
                refresh_token: token.refresh_token,
                token_type: token.token_type,
                expiry_date: token.expiry_date
            },
            webhook:{
                channelId :subscription.id
            }
        }
        //saving to db:
        user.gdrive.webhook = {

        }
        Logger.d(TAG, 'server is hooked to user ' + email + 'Activities', 'green');

    }
    catch (e) {
        Logger.d(TAG, 'Err >>>>>>>>>>>>' + e, 'red');
    }
})
/*Domain Verification -IN google in order to use webhook we should verify domain ownership
by specifing a route that will return an html downloaded from google*/
// router.get('/googlebdff09854abfa74b.html', (req, res) => {
//     res.sendFile(path.join(__dirname, '../public/googlebdff09854abfa74b.html'));
// })

/**3.hook to user activities - google will inform to this route all the activities of the user */
router.get('/webhook/gdrive', async (req: express.Request, res) => {
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
        // process changes
        console.log('Change!');
        // Gdrive.handleNotification(channelId, channelResState);
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
