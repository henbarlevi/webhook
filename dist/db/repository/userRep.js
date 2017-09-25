"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = require("../schemas/user");
const Logger_1 = require("../../utils/Logger");
const TAG = 'User Repository';
class UserRepository {
    //partial update -https://stackoverflow.com/questions/11655270/mongoose-and-partial-select-update
    getUserByGoogleEmail(email) {
        return new Promise((res, rej) => {
            Logger_1.Logger.d(TAG, `**finding user By Google Email > ${email}** `);
            user_1.User.findOne({ 'google.email': email }, (err, userDoc) => {
                if (err) {
                    return rej(err);
                }
                if (!userDoc) {
                    Logger_1.Logger.d(TAG, 'Didnt Find user! ');
                    return res(userDoc);
                }
                Logger_1.Logger.d(TAG, 'user Found : ');
                //  console.log(userDoc);
                res(userDoc);
            });
        });
    }
    updateOrCreateUserGoogleCreds(email, tokens) {
        return new Promise((res, rej) => {
            /*find user by email - if exist - update it/else create it*/
            Logger_1.Logger.d(TAG, '**updating user Google token Creds/creating user** ');
            let options = { upsert: true, new: true, setDefaultsOnInsert: false }; //options that make create new doc record if it doesnt find one https://stackoverflow.com/questions/33305623/mongoose-create-document-if-not-exists-otherwise-update-return-document-in 
            user_1.User.findOneAndUpdate({ 'google.email': email }, { $set: { "google.tokens": tokens } }, options, (err, userDoc) => {
                if (err) {
                    Logger_1.Logger.d(TAG, 'DB ERROR! ', 'red');
                    return rej(err);
                }
                Logger_1.Logger.d(TAG, 'user created/updated');
                //      console.log(userDoc);
                res(userDoc);
            });
        });
    }
    updateUserGdriveWebhook(email, webhook) {
        return new Promise((res, rej) => {
            Logger_1.Logger.d(TAG, '**updating user Gdrive-Webhook ** ');
            user_1.User.findOneAndUpdate({ 'google.email': email }, { $set: { "google.gdrive.webhook": webhook } }, (err, userDoc) => {
                if (err) {
                    Logger_1.Logger.d(TAG, 'DB ERROR! ', 'red');
                    return rej(err);
                }
                Logger_1.Logger.d(TAG, 'user updated');
                //      console.log(userDoc);
                res(userDoc);
            });
        });
    }
    getUserByGdriveChannelId(channelId) {
        return new Promise((res, rej) => {
            Logger_1.Logger.d(TAG, `**finding user By Gdrive Webhook Channel ID > ${channelId}** `);
            user_1.User.findOne({ 'google.gdrive.webhook.id': channelId }, (err, userDoc) => {
                if (err) {
                    return rej(err);
                }
                if (!userDoc) {
                    Logger_1.Logger.d(TAG, 'Didnt Find user! ');
                    return res(userDoc);
                }
                Logger_1.Logger.d(TAG, 'user Found : ');
                //    console.log(userDoc);
                res(userDoc);
            });
        });
    }
    // ============= GMAIL
    udpateUserGmailWebhook(email, webhook) {
        return new Promise((res, rej) => {
            Logger_1.Logger.d(TAG, '**updating user Gmail-Webhook Creds** ');
            user_1.User.findOneAndUpdate({ 'google.email': email }, { $set: { "google.gmail.webhook": webhook } }, (err, userDoc) => {
                if (err) {
                    Logger_1.Logger.d(TAG, 'DB ERROR! ', 'red');
                    return rej(err);
                }
                Logger_1.Logger.d(TAG, 'user gmail webhook details updated');
                //  console.log(userDoc);
                res(userDoc);
            });
        });
    }
    updateUserGmailHistoryId(email, historyId) {
        return new Promise((res, rej) => {
            Logger_1.Logger.d(TAG, '**updating user Gmail-webhook historyId to : ' + historyId + ' ** ');
            user_1.User.findOneAndUpdate({ 'google.email': email }, { $set: { "google.gmail.webhook.historyId": historyId } }, (err, userDoc) => {
                if (err) {
                    Logger_1.Logger.d(TAG, 'DB ERROR! ', 'red');
                    return rej(err);
                }
                Logger_1.Logger.d(TAG, 'user gmail webhook historyId updated');
                // console.log(userDoc);
                res(userDoc);
            });
        });
    }
}
exports.UserRepository = UserRepository;
//================================ OLD =============
// updateOrCreate(user: iUserDB) {
//     return new Promise((res, rej) => {
// /*find user by email - if exist - update it/else create it*/
// Logger.d(TAG, '**updating/creating user** ');
// Logger.d(TAG, '**updating to >** ');
// console.log(user);
// let options = { upsert: true, new: true, setDefaultsOnInsert: false }; //options that make create new doc record if it doesnt find one https://stackoverflow.com/questions/33305623/mongoose-create-document-if-not-exists-otherwise-update-return-document-in 
// User.findOneAndUpdate({ 'gdrive.email': user.google.email }, user, options, (err, userDoc) => {
//     if (err) {
//         Logger.d(TAG, 'DB ERROR! ', 'red');
//         return rej(err);
//     }
//     Logger.d(TAG, 'user created/updated');
//     console.log(userDoc);
//     res(userDoc);
// })
//     })
// } 
