import * as express from 'express';
import * as fs from 'fs';
import * as Rx from 'rxjs';
import * as path from 'path';
import { GdriveService } from '../services/gdrive';
// ===== Models =====
import { iGoogleToken } from '../models/iGoogleToken.model';
// ===== UTILS =====
import { Logger } from '../utils/Logger'
const TAG: string = 'AppRoutes';
const router: express.Router = express.Router();




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
        await GdriveService.registerWebhook(token.access_token, email);
        Logger.d(TAG, 'server is hooked to user ' + email + 'Activities', 'green');

    }
    catch (e) {
        Logger.d(TAG, 'Err >>>>>>>>>>>>' + e, 'red');
    }
})
/*Domain Verification -IN google in order to use webhook we should verify domain ownership
by specifing a route that will return an html downloaded from google*/
router.get('/verify-domain/googlebdff09854abfa74b.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/googlebdff09854abfa74b.html'));
})
/**hook to user activities - google will inform to this route all the activities of the user */
router.get('/webhook/gdrive', async (req: express.Request, res) => {
    Logger.d(TAG, '=================== User Acitivity ===================', 'cyan');
    console.log(req.body);
    Logger.d(TAG, '=================== / User Acitivity ===================', 'cyan');

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
