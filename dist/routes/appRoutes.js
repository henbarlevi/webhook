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
const gdrive_1 = require("../services/gdrive");
// ===== UTILS =====
const Logger_1 = require("../utils/Logger");
const TAG = 'AppRoutes';
const router = express.Router();
router.get('/', (req, res) => {
    res.send('welcome to server api');
});
/**1.Oauth
 * a.redirect to google consent page */
router.get('/gdrive/auth', (req, res) => {
    let url = gdrive_1.GdriveService.authPageUrl();
    res.redirect(url);
});
/*1.Oauth - b.exchange code with access token
    and get user email
  2. Webhook - registering to webhook in order to get user Gdrive activities
  NOTE - IN google You need to verify domain ownership (in the console.developers.google.com ) to allow webhook
  NOTE - local server cannot register to webhook

  */
router.get('/gdrive/code', (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        let code = req.query.code;
        //1. Oauth - b.exchange code with access token and get user email
        Logger_1.Logger.d(TAG, '========== 1. b.exchange code with access token and get email ==========' + code, 'green');
        Logger_1.Logger.d(TAG, 'code >' + code, 'gray');
        let token = yield gdrive_1.GdriveService.getToken(code);
        Logger_1.Logger.d(TAG, 'token >' + token, 'green');
        let email = yield gdrive_1.GdriveService.getUserEmail(token.id_token);
        Logger_1.Logger.d(TAG, 'user email >' + email, 'gray');
        //2. Webhook - registering to webhook in order to get user Gdrive activities
        yield gdrive_1.GdriveService.registerWebhook(token.access_token, email);
        Logger_1.Logger.d(TAG, 'server is hooked to user ' + email + 'Activities', 'green');
    }
    catch (e) {
        Logger_1.Logger.d(TAG, 'Err >>>>>>>>>>>>' + e, 'red');
    }
}));
/**hook to user activities - google will inform to this route all the activities of the user */
router.get('/webhook/gdrive', (req, res) => __awaiter(this, void 0, void 0, function* () {
    Logger_1.Logger.d(TAG, '=================== User Acitivity ===================', 'cyan');
    console.log(req.body);
    Logger_1.Logger.d(TAG, '=================== / User Acitivity ===================', 'cyan');
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
