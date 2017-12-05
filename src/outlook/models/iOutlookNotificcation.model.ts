/**whebhook notification received when user do activity in his microsoft user [not only on outlook] */
export interface iOutlookNotification {
    '@odata.type':string | '#Microsoft.OutlookServices.Notification'
    Id:string // notificationId -null
    SubscriptionId: string  //Identifies to the client app the subscription to which this notification belongs.
    SubscriptionExpirationDateTime: number  //The expiration date and time for the subscription.
    SequenceNumber: string //A number in sequence for a notification, to help the client app identify if it's missing a notification.
    ChangeType: string //The types of events that the client app wants to be notified on (for example, a Created event type when mail is received, or Update event type when reading a message).
    Resource: string //The URL of the specific resource item that is being monitored (for example, a URL to the changed message or event).
    ResourceData: Object|iResourceData  // A notification related to a resource change (such as receiving, reading or deleting a message) has this additional property that contains the resource ID of the item that was changed. A client can use this resource ID to handle this item according to its business logic (for example, fetch this item, sync its folder).
}

//NOTE - ClientState will be in Headers - //Present only if the client specified the ClientState property in the subscription request. Used by the listener to verify the legitimacy of the notification.



/**
 * EXample for ResourceData:
 * {"@odata.type":"#Microsoft.OutlookServices.Message",
 * "@odata.id":"https://outlook.office.com/api/v2.0/Users('6c4d5e1e-c8fd-47ac-9d22-c5e8dc56594e@65a1678f-e343-44a5-8c41-c51024828e11')/Messages('AAMkAGFlOWFlNDExLTY1MGMtNDEyOC05NmY0LWM4MjI2ODUxNTU4MwBGAAAAAAC7EJqCRBR1RJ-JHt_zPrEsBwCvmaYFS5MVS547IzU3pvYwAAAAAAEJAACvmaYFS5MVS547IzU3pvYwAAAAjNNZAAA=')",
 * "@odata.etag":"W/\"CQAAABYAAACvmaYFS5MVS547IzU3pvYwAAAAjOxb\"",
 * "Id":"AAMkAGFlOWFlNDExLTY1MGMtNDEyOC05NmY0LWM4MjI2ODUxNTU4MwBGAAAAAAC7EJqCRBR1RJ-JHt_zPrEsBwCvmaYFS5MVS547IzU3pvYwAAAAAAEJAACvmaYFS5MVS547IzU3pvYwAAAAjNNZAAA="}}]}
 */

 export interface iResourceData{
     "@odata.type" :string,
     "@odata.id":string,
     "@odata.etag":string
     "Id":string // if a message was sended - this will be the messageID
 }