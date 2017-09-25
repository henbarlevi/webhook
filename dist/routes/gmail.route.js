"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const gmail_1 = require("../services/gmail");
// ===== DB =====
const userRep_1 = require("../db/repository/userRep");
// ===== UTILS =====
const Logger_1 = require("../utils/Logger");
const TAG = 'AppRoutes';
const router = express.Router();
router.get('/', (req, res) => {
    res.send('welcome to server api /gmail Route');
});
/**1.Oauth
 * a.redirect to google consent page */
router.get('/auth', (req, res) => {
    let url = gmail_1.GmailService.authPageUrl();
    res.redirect(url);
});
/*1.Oauth - b.exchange code with access token
    and get user email
  2. Webhook - registering to webhook in order to get user Gdrive activities https://developers.google.com/gmail/api/guides/push
    TODO - check if this user already registered to gmail webhook - if so - there is no need to register him again unless the time expierd
  */
router.get('/code', (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        let code = req.query.code;
        //1. Oauth - b.exchange code with access token and get user email
        Logger_1.Logger.d(TAG, '========== 1. b.exchange code with access token and get email ==========' + code, 'green');
        Logger_1.Logger.d(TAG, 'code >' + code, 'gray');
        let token = yield gmail_1.GmailService.getToken(code);
        Logger_1.Logger.d(TAG, 'token >' + token, 'green');
        let email = yield gmail_1.GmailService.getUserEmail(token.id_token);
        Logger_1.Logger.d(TAG, 'user email >' + email, 'gray');
        Logger_1.Logger.d(TAG, '========== 2. Webhook - registering to webhook in order to get user Gmail activities ==========' + code, 'green');
        let webhookSubscription = yield gmail_1.GmailService.registerWebhook(token.access_token, email);
        let userRep = new userRep_1.UserRepository();
        yield userRep.updateOrCreateUserGoogleCreds(email, token);
        yield userRep.udpateUserGmailWebhook(email, webhookSubscription);
        res.status(200).send('Server hooked to your gmail Activities');
    }
    catch (e) {
        Logger_1.Logger.d(TAG, 'Err >>>>>>>>>>>>' + e, 'red');
        res.status(400).send();
    }
}));
/**getting Gmail user Activities (push notifications) */
router.post('/webhook', (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        Logger_1.Logger.d(TAG, `=================== User  Gmail Acitivity ===================`, 'cyan');
        Logger_1.Logger.d(TAG, `=================== User  Gmail Acitivity ===================`, 'cyan');
        Logger_1.Logger.d(TAG, `=================== User  Gmail Acitivity ===================`, 'cyan');
        let notification = req.body;
        Logger_1.Logger.d(TAG, JSON.stringify(req.body), 'cyan');
        // decrypt from base64:
        let notificationData = JSON.parse(Buffer.from(notification.message.data, 'base64').toString('ascii'));
        //get details about the pushed notification:
        let userRep = new userRep_1.UserRepository();
        let userDoc = yield userRep.getUserByGoogleEmail(notificationData.emailAddress);
        let access_token = userDoc.google.tokens.access_token;
        let historyId = userDoc.google.gmail.webhook.historyId;
        if (userDoc.google.tokens.access_token) {
            //let changesDetails: iGmailChangesResponse = await GmailService.getChanges(access_token, notificationData.emailAddress, historyId);
            let changesDetails = yield gmail_1.GmailService.handleNotification(access_token, notificationData.emailAddress, historyId);
            //save the historyId in db (for the next notificaiton for this user in the future) :
            yield userRep.updateUserGmailHistoryId(notificationData.emailAddress, changesDetails.historyId);
        }
        Logger_1.Logger.d(TAG, `=================== / User  Gmail Acitivity ===================`, 'cyan');
        Logger_1.Logger.d(TAG, `=================== / User  Gmail Acitivity ===================`, 'cyan');
        Logger_1.Logger.d(TAG, `=================== / User  Gmail Acitivity ===================`, 'cyan');
    }
    catch (e) {
        Logger_1.Logger.d(TAG, 'Err >>>>>>>>>>>>' + e, 'red');
    }
    finally {
        res.status(200).send('got the message');
    }
}));
exports.default = router;
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
