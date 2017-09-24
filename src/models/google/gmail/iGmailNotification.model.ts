//https://developers.google.com/gmail/api/guides/push#receiving_notifications
//when reciving notification about mailbox update occurs to the webhook endpoint (/gmail/webhook)
export interface iGmailNotification {
  message:
  {
    // This is the actual notification data, as base64url-encoded JSON.
    data: string, //"eyJlbWFpbEFkZHJlc3MiOiAidXNlckBleGFtcGxlLmNvbSIsICJoaXN0b3J5SWQiOiAiMTIzNDU2Nzg5MCJ9",

    // This is a Cloud Pub/Sub message id, unrelated to Gmail messages.
    message_id: string,// "1234567890",
  }
  //the subscription of the app as mentioned in https://console.cloud.google.com/cloudpubsub/subscriptions
  subscription: string  //"projects/myproject/subscriptions/mysubscription"

}


//after decrypting the iGmailNotification.message.data from base64:
export interface iGmailNotificationData {
  emailAddress: string,
  historyId: string
}