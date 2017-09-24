import * as express from 'express';
import * as fs from 'fs';
import * as Rx from 'rxjs';
import * as path from 'path';
import { GmailService } from '../services/gmail';
// ===== Models =====
import { iGoogleToken, iGdriveWebSubResponse } from '../models';
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
  2. Webhook - registering to webhook in order to get user Gdrive activities


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
        await GmailService.registerWebhook(token.access_token, email);

    }
    catch (e) {
        Logger.d(TAG, 'Err >>>>>>>>>>>>' + e, 'red');
    }
})
router.post('/webhook', async (req: express.Request, res) => {
    Logger.d(TAG, `=================== User  Gmail Acitivity ===================`, 'cyan');
    Logger.d(TAG, req.body, 'cyan');
    
    Logger.d(TAG, `=================== / User  Gmail Acitivity ===================`, 'cyan');
    
    res.status(200).send('got the message');
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

