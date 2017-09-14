import { User } from '../schemas/user';
import { Logger } from '../../utils/Logger';

const TAG: string = 'User Repository';
export class UserRepository {
    updateOrCreate(user: iUserDB) {
        return new Promise((res, rej) => {
            Logger.d(TAG, '**updating/creating user** ');

            let options = { upsert: true, new: true, setDefaultsOnInsert: false }; //options that make create new doc record if it doesnt find one https://stackoverflow.com/questions/33305623/mongoose-create-document-if-not-exists-otherwise-update-return-document-in 
            User.findOne({ "gdrive.email": user.gdrive.email }, user, (err, userDoc) => {
                if (err) {
                    return rej(err);
                }
                res(userDoc);
            })
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

        })
    }
    getUserByChannelId(channelId: string) : Promise<any> {
        return new Promise((res, rej) => {
            Logger.d(TAG, '**finding user By Channel IDr** ');

            User.findOne({ "gdrive.webhook.id": channelId }, (err, userDoc) => {
                if (err) {
                    return rej(err);
                }
                if (userDoc) {
                    Logger.d(TAG, 'Didnt Find user! ');
                }
                res(userDoc);

            })
        });
    }

}

export interface iUserDB {
    gdrive: {
        email: string,
        tokens: {
            access_token: string,
            id_token: string,
            refresh_token?: string,
            token_type: string,//"Bearer"
            expiry_date: number
        },
        webhook: {
            /**
             * A UUID or similar unique string that identifies this channel.
             */
            id: string,
            /**
             * An opaque ID that identifies the resource being watched on this channel
             */
            resourceId: string,
            /**
             * A version-specific identifier for the watched resource.
             */
            resourceUri: string,
            /**
             * An arbitrary string delivered to the target address with each notification delivered over this channel.
             * in our case it is the user email.
             */
            token: string,
            /**
             * Date and time of notification channel expiration, expressed as a Unix timestamp, in milliseconds.
             */
            expiration: number,
            /**
             * token that send to google server in order to tell it from which moment of time to get the user activities that happend
            */
            pageToken?: string
        }
    }
}