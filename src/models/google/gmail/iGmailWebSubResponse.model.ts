/*
https://developers.google.com/gmail/api/v1/reference/users/watch#response
 Gmail response for Webhook registeration
*/
export interface iGmailWebSubResponse{
    historyId:string, //The ID of the mailbox's current history record.
    expiration:string
}