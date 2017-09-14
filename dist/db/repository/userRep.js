"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = require("../schemas/user");
const Logger_1 = require("../../utils/Logger");
const TAG = 'User Repository';
class UserRepository {
    updateOrCreate(user) {
        return new Promise((res, rej) => {
            Logger_1.Logger.d(TAG, '**updating/creating user** ');
            let options = { upsert: true, new: true, setDefaultsOnInsert: false }; //options that make create new doc record if it doesnt find one https://stackoverflow.com/questions/33305623/mongoose-create-document-if-not-exists-otherwise-update-return-document-in 
            user_1.User.findOne({ "gdrive.email": user.gdrive.email }, user, (err, userDoc) => {
                if (err) {
                    Logger_1.Logger.d(TAG, 'DB ERROR! ', 'red');
                    return rej(err);
                }
                Logger_1.Logger.d(TAG, 'user created/updated');
                console.log(userDoc);
                res(userDoc);
            });
            // let options = { upsert: true, new: true, setDefaultsOnInsert: false }; //options that make create new doc record if it doesnt find one https://stackoverflow.com/questions/33305623/mongoose-create-document-if-not-exists-otherwise-update-return-document-in 
            // User.findOne({ "gdrive.email": user.gdrive.email }, (err, userDoc) => {
            //     if (err) {
            //         return rej(err);
            //     }
            //     if (!userDoc) {
            //         Logger.d(TAG,'** user doesnt exist , creating user','yellow');
            //         User.create(user, (err, userDoc) => {
            //             if (err) {
            //                 return rej(err);
            //             }
            //             res(userDoc);
            //         })
            //     }
            // })
        });
    }
    getUserByChannelId(channelId) {
        return new Promise((res, rej) => {
            Logger_1.Logger.d(TAG, '**finding user By Channel IDr** ');
            user_1.User.findOne({ "gdrive.webhook.id": channelId }, (err, userDoc) => {
                if (err) {
                    return rej(err);
                }
                if (userDoc) {
                    Logger_1.Logger.d(TAG, 'Didnt Find user! ');
                }
                res(userDoc);
            });
        });
    }
}
exports.UserRepository = UserRepository;
