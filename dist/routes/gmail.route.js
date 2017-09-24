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
const TAG = 'AppRoutes';
const router = express.Router();
router.get('/', (req, res) => {
    res.send('welcome to server api /gmail Route');
});
/**1.Oauth
 * a.redirect to google consent page */
router.get('/auth', (req, res) => {
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
}));
router.get('/webhook', (req, res) => __awaiter(this, void 0, void 0, function* () {
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
