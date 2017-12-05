/**response when requesting to CREATE no subscription */
export interface iSubscriptionResponse {
    id: string, //The unique subscription ID which the client app should save to match with future notifications. // NTM4M0IzOEEtMDEyNi00RTAxLTk2NDEtMzU2NTk4RUM2RTNBX0FFOUFFNDExLTY1MEMtNDEyOC05NkY0LUM4MjI2ODUxNTU4Mw==
    ChangeType: string //Apart from the values specified in the request, the response includes the additional notification type, Missed
    /**The date and time that the subscription will expire. If the subscription request does not specify an expiration time, 
     * or if the request specifies an expiration time longer than the maximum allowed, this property will be set to that maximum allowed length from the time the request is sent. 
     * For a subscription that requests rich notifications of specific properties, the maximum allowed is 1 day. For other subscriptions, the maximum is 7 days. */
    SubscriptionExpirationDateTime: string
    "@odata.context": string,//'https://outlook.office.com/api/v2.0/$metadata#Me/Subscriptions/$entity'
    '@odata.type': string // '#Microsoft.OutlookServices.PushSubscription',
    '@odata.id': string //'https://outlook.office.com/api/v2.0/Users(\'6c4d5e1e-c8fd-47ac-9d22-c5e8dc56594e@65a1678f-e343-44a5-8c41-c51024828e11\')/Subscriptions(\'NTM4M0IzOEEtMDEyNi00RTAxLTk2NDEtMzU2NTk4RUM2RTNBX0FFOUFFNDExLTY1MEMtNDEyOC05NkY0LUM4MjI2ODUxNTU4Mw==\')',
    Resource: 'https://outlook.office.com/api/v2.0/me/messages',
    NotificationURL: string//the endpoint that  will recieve the notifications // 'https://shieldox-mail-webhook.azurewebsites.net/outlook/notification',
    ClientState?: string//the clientstate that sent in the create subscription request
}