/*
https://developers.google.com/gmail/api/v1/reference/users/watch#response
 Gmail response for Webhook registeration (equivelent to iSubscription Response in Outlook)
*/
export interface iWatchResponse{
    historyId:string, //The ID of the mailbox's current history record.
    expiration:string 	/*When Gmail will stop sending notifications for mailbox updates (epoch millis).
     Call watch again before this time to renew the watch.
*/
}