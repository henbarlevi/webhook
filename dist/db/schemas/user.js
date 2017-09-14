"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const schema = new Schema({
    gdrive: {
        email: String,
        tokens: {
            access_token: String,
            id_token: String,
            refresh_token: String,
            token_type: String,
            expiry_date: Number
        },
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
    }
});
const User = mongoose.model('User', schema);
exports.User = User;
