//instead of DB we save the user here
let user :iUserDB;
export { user}

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