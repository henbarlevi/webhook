import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;


const schema = new Schema({
    google: {
        email: String,
        tokens: {
            access_token: String,
            id_token: String,
            refresh_token: String, //Optional
            token_type: String,//"Bearer"
            expiry_date: Number
        },
        gdrive: {
            webhook: {
                /**
                 * A UUID or similar unique String that identifies this channel.
                 */
                id: String,
                /**
                 * An opaque ID that identifies the resource being watched on this channel
                 */
                resourceId: String,
                /**
                 * A version-specific identifier for the watched resource.
                 */
                resourceUri: String,
                /**
                 * An arbitrary String delivered to the target address with each notification delivered over this channel.
                 * in our case it is the user email.
                 */
                token: String,
                /**
                 * Date and time of notification channel expiration, expressed as a Unix timestamp, in milliseconds.
                 */
                expiration: Number,
                /**
                 * token that send to google server in order to tell it from which moment of time to get the user activities that happend
                */
                pageToken: String
            }
        },
        gmail:{
            webhook:{
                historyId :String /*from which point of time we wont to get user gmail activities/changes */
            }
        }
    }


});

const User = mongoose.model('User', schema);
export { User }