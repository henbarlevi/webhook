import * as express from 'express';
import * as fs from 'fs';
import * as Rx from 'rxjs';
import * as path from 'path';
import { GdriveService } from '../services/gdrive';
// ===== Models =====
import { iGoogleToken ,iGdriveWebSubResponse} from '../models';
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

})
router.get('/webhook',async (req: express.Request, res) =>{
    
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

