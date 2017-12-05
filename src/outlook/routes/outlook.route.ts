import * as express from 'express';
import * as fs from 'fs';

const router: express.Router = express.Router();
// ==== services
import { OutlookService } from '../services/outlook.service';
// ==== utils
import { Logger } from '../../utils/Logger';
import { iMicrosoftToken } from '../models/iOauthToken.model';
import { iSubscriptionResponse } from '../models/iSubscriptionResponse.model';
import { iOutlookNotification, iResourceData } from '../models/iOutlookNotificcation.model';
import { iOutlookMessage } from '../models/iOutlookMessage.mdel';
import { iOutlookAttachment, iOutlookAttachmentResponse } from '../models/iOutlookAttachment.model';
const TAG: string = 'Outlook Routes |';

let DbMockToken: string //will save user access_token for now 

router.get('/', (req: express.Request, res: express.Response) => {
    res.send('welcome to outlook api');
})

/**=================================== */
/**Oauth 2.0 */
/**=================================== */

/**redirect user to microsoft login page */
router.get('/auth', (req: express.Request, res: express.Response) => {
    Logger.t(TAG, `Ouath with outlook`, 'green');
    let url: string = OutlookService.consentPageUrl();
    Logger.d(TAG, `redirect to consent page >` + url);
    res.redirect(url);
})

router.get('/code', async (req: express.Request, res: express.Response) => {
    try {

        let code: string = req.query.code;
        Logger.st(TAG, `1. got code`, 'green');
        Logger.d(TAG, `code =` + code.slice(0, 10) + '....');
        let token: iMicrosoftToken = await OutlookService.getToken(code);

        DbMockToken = token.access_token; //simulate saving tokens in db
        Logger.st(TAG, `2. Got Access Token Sucessfuluy`, 'green');
        printTokenDetials(token);//console.log
        //creating webhook subscription:
        let subscription: iSubscriptionResponse = await OutlookService.createWebhookSubscription(token.access_token);
        Logger.st(TAG, `3. registred to webhook for user ${token.access_token}(=access_token)`, 'green');
        console.log(subscription);





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
 * 1. validationToken - if exist in the req.query it means that microsoft just checking that this endpoint is legit - we should return back the validationToken
 * 2. receiving in the body a chunk of notifications
 * 3. pull from db - user access_token by subscriptionId
 * 3. using Outlook API to get more info about the notification - for example get email message by id
 * 
 */
router.post('/notification', async (req: express.Request, res: express.Response) => {
    try {
        //1. validationToken - if exist in the req.query it means that microsoft just checking that this endpoint is legit - we should return back the validationToken
        let validationtoken: string = req.query.validationtoken;
        validationtoken ? Logger.d(TAG, `receivied validationToken : ${validationtoken}`, 'green') : ''
        validationtoken ? res.status(200).send(validationtoken) : res.status(200).end();

        if (!validationtoken) {
            //2.receiving in the body a chunk of notifications
            let notificationActivity: { value: iOutlookNotification[] } = req.body;
            let notifications: iOutlookNotification[] = notificationActivity.value;
            Logger.t(TAG, `Outlook User Activity`, 'green');
            //print notifications
            console.log(notificationActivity);


            //deleting subscription - TEST
            setTimeout(async () => {
                Logger.st(TAG, `4. deleteing subscription for SubId:${notifications[0].SubscriptionId}`, 'yellow');
                let response = await OutlookService.deleteWebhookSubscription(DbMockToken, notifications[0].SubscriptionId);
                Logger.d(TAG, `subscriptionId:${notifications[0].SubscriptionId.slice(1, 12)} has been DELETED!`, 'green');
            }, 1000 * 60 * 5);


            for (let notification of notifications) {
                //3.checking that the notification is a message & it contain attachments - if so getting the attachments binary data.
                let notificationResource = notification.ResourceData as iResourceData;
                //if a message was sent - check that message
                if (notificationResource["@odata.type"] === '#Microsoft.OutlookServices.Message') {
                    //get message
                    let message_id: string = notificationResource.Id;
                    let message: iOutlookMessage = await OutlookService.getMessageById(DbMockToken, message_id);
                    Logger.d(TAG, `|--- Message ${message_id.slice(0, 10)}... Details : ---|`, 'magenta');                  
                    console.log(message);
                    message.HasAttachments ? Logger.d(TAG, `Attachments=YES | Message ${message_id.slice(0, 10)} Contains Attachments !`, 'yellow') : Logger.d(TAG, `Attachments=NO | Message ${message_id.slice(0, 10)} NOT Contains Attachments !`, 'yellow')
                    //get attachments of message (if exist)
                    if (message.HasAttachments) {
                        let attachmentsResponse: iOutlookAttachmentResponse = await OutlookService.getMessageAttachments(DbMockToken, message_id);
                        Logger.st(TAG, `Attachments of Message ${message_id.slice(0, 10)}...`, 'bgGreen');
                        Logger.d(TAG,attachmentsResponse.value,'bgGreen')
                        
                        
                    }
                }
            }
            //getting messageInfo
        }
    }
    catch (e) {
        Logger.d(TAG, `Err ===============> ${e}`, 'red')
    }
})
export default router;




function printTokenDetials(token: iMicrosoftToken) {
    console.log(`access_token= ${token.access_token.slice(0, 10)}....`);
    console.log(`token_type= ${token.token_type}`);
    console.log(`id_token= ${token.id_token.slice(0, 10)}....`);
    console.log(`expires_in= ${token.expires_in}`);
    console.log(`ext_expires_in= ${token.ext_expires_in}`);
    console.log(`scope= ${token.scope}`);

}
function printNotifications(notifications: iOutlookNotification[]) {
    notifications.forEach((n, index) => {
        Logger.d(TAG, 'Notification Number ' + index + 1, 'yellow');
        Logger.d(TAG, `NotificationID =${n.Id}`)
        Logger.d(TAG, `SubscriptionId =${n.SubscriptionId}`)
        Logger.d(TAG, `ChangeType =${n.ChangeType}`)
        Logger.d(TAG, `Resource =${n.Resource}`)
        Logger.d(TAG, `ResourceData =${JSON.stringify(n.ResourceData)}`)
        Logger.d(TAG, `SequenceNumber =${n.SequenceNumber}`)
        Logger.d(TAG, `SubscriptionExpirationDateTime =${n.SubscriptionExpirationDateTime}`)
    })
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
