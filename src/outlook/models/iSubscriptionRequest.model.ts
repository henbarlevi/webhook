//body when wanting to CREATE subscription to user activities
export interface iSubscriptionRequest {
    ChangeType: string,// "Created"; //	Indicates the type of events that will raise a notification- https://msdn.microsoft.com/en-us/office/office365/api/notify-rest-operations#changetype
    ClientState?: string//[Optional]  property that will be sent back in each notification event from microsoft graph (in the headers) (can be used to validate the notification legitimacy)
    NotificationURL: string;   //Specifies where notifications should be sent to (my resource)
    "@odata.type": string // "#Microsoft.OutlookServices.PushSubscription";
    Resource: string // "https://outlook.office.com/api/v2.0/me/messages";//Specifies the resource to monitor and receive notifications on (outlook/calander/onedrive/ etc..). (for example - https://outlook.office.com/api/v2.0/me/events -this for calander events) 
    ExpirationDateTime?: number//define when this subscription sould end - if not defiend - will be 1 day for reach sub/7 days for normal 
}

