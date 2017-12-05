import * as express from 'express';
import * as fs from 'fs';

const router: express.Router = express.Router();
// ==== services
import { GmailService } from '../services/gmail.service';
// ==== utils
import { Logger } from '../../utils/Logger';
import { iGoogleToken } from '../models/iGoogleToken.model';
import { iGmailNotification, iGmailNotificationData } from '../models/iGmailNotification.model';
import { iSubscriptionResponse } from '../models/iSubscriptionResponse.model';
import { iGmailHistory } from '../models/iGmailHistory.model';
import { iGmailMessage } from '../models/iGmailMessage.model';
const TAG: string = 'Gmail Routes |';

let DbMockToken: string //will save user access token for now 
let DbMockHistoryId: string//will save HistoryId for now

router.get('/', (req: express.Request, res: express.Response) => {
    res.send('welcome to mailwebhook gmail api');
})

/**=================================== */
/**Oauth 2.0 */
/**=================================== */

/**redirect user to Google login page */
router.get('/auth', (req: express.Request, res: express.Response) => {
    Logger.t(TAG, `Ouath with Google`, 'green');
    let url: string = GmailService.consentPageUrl();
    Logger.d(TAG, `** redirect to consent page >${url} **`, 'gray');
    res.redirect(url);
})

router.get('/code', async (req: express.Request, res: express.Response) => {
    try {

        let code: string = req.query.code;
        Logger.st(TAG, `1. got code`, 'green');
        Logger.d(TAG, `code =` + code.slice(0, 10) + '....');
        let token: iGoogleToken = await GmailService.getToken(code);
        // //TODELETE:
        DbMockToken = token.access_token;
        Logger.st(TAG, `2. Got Access Token Sucessfuluy`, 'green');
        printTokenDetials(token);//console.log
        //subscribe to user Gmail Events
        let subscription: iSubscriptionResponse = await GmailService.createWebhookWatch(token.access_token);
        DbMockHistoryId = subscription.historyId;
        Logger.st(TAG, `3. registred to webhook for user ${token.access_token}(=access_token)`, 'green');





        res.status(200).end();
    }
    catch (e) {
        Logger.d(TAG, `Err ===============> ${e}`, 'red')
    }
})

/**=================================== */
/**Webhook */
/**=================================== */

/**
 * General workflow
    1.decrypt notification recieved and getting historyId of the notification received
      @param historyId - present a specific point in time
        a.if the db doesn't contain already HistoryId - we will use the notification historyId, otherwise will use the historyId from db
    2.
 */
/**getting Gmail user Activities (push notifications) */
router.post('/notification', async (req: express.Request, res) => {
    res.status(200).send('got notification');
    try {
        Logger.t(TAG, `Gmail User Activity`, 'green');
        let notification: iGmailNotification = req.body;
        Logger.st(TAG, 'Stringify Notification :')
        Logger.d(TAG, JSON.stringify(req.body));
        // decrypt from base64:
        let notificationData: iGmailNotificationData = JSON.parse(Buffer.from(notification.message.data, 'base64').toString('ascii'));
        Logger.d(TAG, `Notification HistoryId = ${notificationData.historyId}`, 'yellow');
        Logger.d(TAG, `Notification User Email = ${notificationData.emailAddress}`, 'yellow');
        
        //TODO - get user access_token from db by user email
        //get details about the pushed notification:
        //TODO -suppose to pull user's access token ,historyId from db
        let historyId: string = DbMockHistoryId;
        if (!historyId) {//if user in db doestn contain historyId
            //use the historyId in the
            historyId = notificationData.historyId;
        }
        Logger.st(TAG, 'getting activity details', 'green');
        let access_token = DbMockToken;

        DbMockHistoryId =await GmailService.handleNotification(access_token, historyId);
        Logger.d(TAG, 'Finished Handling Notification')

        // //just for TEST - deleting sub
        // await GmailService.deleteWebhookWatch(access_token);
        // Logger.d(TAG,`Deleteing Webhook Sub(=watch) for user ${access_token.slice(0,4)}..`);
    }
    catch (e) {
        Logger.d(TAG, 'Err ========>' + e, 'red');
    }
    finally {
        Logger.t(TAG, `END / Gmail User Activity`, 'green');

    }



})
export default router;


function printTokenDetials(token: iGoogleToken) {
    console.log(`access_token= ${token.access_token.slice(0, 10)}....`);
    console.log(`token_type= ${token.token_type}`);
    console.log(`refresh_token =${token.refresh_token}`);
    console.log(`expiry_date =${token.expiry_date}`);

}
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
