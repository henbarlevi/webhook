//https://developers.google.com/gmail/api/guides/push#receiving_notifications
//when reciving Gmail notification
export interface iGmailNotification {
    message:
    {
      // This is the actual notification data, as base64url-encoded JSON.
      data: string, //"eyJlbWFpbEFkZHJlc3MiOiAidXNlckBleGFtcGxlLmNvbSIsICJoaXN0b3J5SWQiOiAiMTIzNDU2Nzg5MCJ9",
  
      message_id: string,// This is a Cloud Pub/Sub message id, unrelated to Gmail messages.// "1234567890",
      publishTime:string , //"2017-12-03T09:48:51.274Z"
    }
    //the subscription of the app as mentioned in https://console.cloud.google.com/cloudpubsub/subscriptions
    subscription: string //the subscription name //"projects/myproject/subscriptions/mysubscription"
  
  }
  
  
  //after decrypting the iGmailNotification.message.data from base64:
  export interface iGmailNotificationData {
    emailAddress: string,
    historyId: string
  }