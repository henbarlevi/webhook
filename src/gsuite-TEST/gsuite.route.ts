import * as express from 'express';
import * as fs from 'fs';

const router: express.Router = express.Router();
// ==== services
//import { GmailService } from '../services/gmail.service';
import { GsuiteService } from './gsuite.service';


// ==== utils
import { Logger } from '../utils/Logger';
import { GmailService } from '../gmail/services/gmail.service';
import { DBMOCK } from './DBMOCK.service';
const TAG: string = 'Gsuite Routes |';




router.get('/', (req: express.Request, res: express.Response) => {
    res.send('welcome to mailwebhook Gsuite api');
})

//webhook to all the users in organization owned by the impersonated admin user
router.get('/tst', (req: express.Request, res: express.Response) => {
    res.status(200).send('ok');
    GsuiteService.getUsers('shieldox.com').then(async (response: any) => {

        Logger.d(TAG, `domain [shieldox.com] got ${response.users ? response.users.length : 0} users`, 'yellow')
        if (response.users) {
            for (let user of response.users) {
                try {

                        let tokens = await GsuiteService.getServiceAccountTokens(user.primaryEmail);
                        await GmailService.createWebhookWatch(tokens.access_token, user.id)
                        Logger.d(TAG, 'webhook succedded for ' + user.primaryEmail, 'green')
                        //TST (saving user creds in db):
                        DBMOCK.setToken(user.primaryEmail,tokens.access_token);
                }
                catch (e) { }
            }

        }
    })
})

//TST - deleting all webhooks
router.get('/delete', async (req: express.Request, res: express.Response) => {
    res.status(200).send('ok');
    try{

        for(let email of Object.keys(DBMOCK.getallusers())){//pull from db token by email:
            let access_token = DBMOCK.getToken(email);
            await GmailService.deleteWebhookWatch(access_token);
            Logger.d(TAG,'Succefully Deleted','gray');
        }
    }
    catch(e){
        Logger.d(TAG,e,'red');
    }
})

export default router;


