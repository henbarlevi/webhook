
/**
 * res: https://developers.google.com/drive/v2/reference/changes/watch
 */
export interface iGdriveWebSubResponse {
    /**
     * A UUID or similar unique string that identifies this channel.
     * in our case it is the user email.
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
    expiration: number;

}