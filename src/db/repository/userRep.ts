import { User } from '../schemas/user';
import { Logger } from '../../utils/Logger';

// ===== models
import { iGoogleCreds, iGoogleToken, iGdriveWebSubResponse, iGmailWebSubResponse } from '../../models';
const TAG: string = 'User Repository';
export class UserRepository {
    //partial update -https://stackoverflow.com/questions/11655270/mongoose-and-partial-select-update
    getUserByGoogleEmail(email: string): Promise<any> {
        return new Promise((res, rej) => {
            Logger.d(TAG, `**finding user By Google Email > ${email}** `);

            User.findOne({ 'google.email': email }, (err, userDoc) => {
                if (err) {
                    return rej(err);
                }
                if (!userDoc) {
                    Logger.d(TAG, 'Didnt Find user! ');
                    return res(userDoc)
                }
                Logger.d(TAG, 'user Found : ');
                console.log(userDoc);

                res(userDoc);

            })
        });
    }
    updateOrCreateUserGoogleCreds(email: string, tokens: iGoogleToken) {
        return new Promise((res, rej) => {


            /*find user by email - if exist - update it/else create it*/
            Logger.d(TAG, '**updating user Google token Creds/creating user** ');

            let options = { upsert: true, new: true, setDefaultsOnInsert: false }; //options that make create new doc record if it doesnt find one https://stackoverflow.com/questions/33305623/mongoose-create-document-if-not-exists-otherwise-update-return-document-in 
            User.findOneAndUpdate({ 'google.email': email }, { $set: { "google.tokens": tokens } }, options, (err, userDoc) => {
                if (err) {
                    Logger.d(TAG, 'DB ERROR! ', 'red');

                    return rej(err);
                }
                Logger.d(TAG, 'user created/updated');
                console.log(userDoc);

                res(userDoc);
            })
        })
    }
    updateUserGdriveWebhook(email: string, webhook: iGdriveWebhook) {
        return new Promise((res, rej) => {
            Logger.d(TAG, '**updating user Gdrive-Webhook ** ');

            User.findOneAndUpdate({ 'google.email': email }, { $set: { "google.gdrive.webhook": webhook } }, (err, userDoc) => {

                if (err) {
                    Logger.d(TAG, 'DB ERROR! ', 'red');
                    return rej(err);
                }
                Logger.d(TAG, 'user updated');
                console.log(userDoc);

                res(userDoc);
            })
        })

    }
    getUserByGdriveChannelId(channelId: string): Promise<any> {
        return new Promise((res, rej) => {
            Logger.d(TAG, `**finding user By Gdrive Webhook Channel ID > ${channelId}** `);

            User.findOne({ 'google.gdrive.webhook.id': channelId }, (err, userDoc) => {
                if (err) {
                    return rej(err);
                }
                if (!userDoc) {
                    Logger.d(TAG, 'Didnt Find user! ');
                    return res(userDoc)
                }
                Logger.d(TAG, 'user Found : ');
                console.log(userDoc);

                res(userDoc);

            })
        });
    }
    // ============= GMAIL
    udpateUserGmailWebhook(email: string, webhook: iGmailWebSubResponse) {
        return new Promise((res, rej) => {
            Logger.d(TAG, '**updating user Gmail-Webhook Creds** ');

            User.findOneAndUpdate({ 'google.email': email }, { $set: { "google.gmail.webhook": webhook } }, (err, userDoc) => {

                if (err) {
                    Logger.d(TAG, 'DB ERROR! ', 'red');
                    return rej(err);
                }
                Logger.d(TAG, 'user gmail webhook details updated');
                console.log(userDoc);

                res(userDoc);
            })
        })
    }
    updateUserGmailHistoryId(email: string, historyId: string) {
        return new Promise((res, rej) => {
            Logger.d(TAG, '**updating user Gmail-webhook historyId** ');

            User.findOneAndUpdate({ 'google.email': email }, { $set: { "google.gmail.webhook.historyId": historyId } }, (err, userDoc) => {

                if (err) {
                    Logger.d(TAG, 'DB ERROR! ', 'red');
                    return rej(err);
                }
                Logger.d(TAG, 'user gmail webhook historyId updated');
                console.log(userDoc);

                res(userDoc);
            })
        })
    }

}

export interface iUserDB {
    google: {
        email: String,
        tokens: iGoogleToken,
        gdrive: {
            webhook: iGdriveWebhook
        },
        gmail: {
            webhook: iGmailWebSubResponse
        }
    }
}
/**webhook Creds that s */
export interface iGdriveWebhook extends iGdriveWebSubResponse {
    /**
     * * token that send to google server in order to tell it from which moment of time to get the user activities that happend
   */
    pageToken?: string
}

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