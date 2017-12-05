## ================================
# Overview
## ================================
###  this project show how to webhook with Outlook Gdrive and Gmail (will give general understanding also to OneDrive).

## run project with **npm run dev**

* #### this is the old script of npm run dev [run 'compile' and 'start' in  2 different windows]
   ```json
        "dev": "start cmd /k npm run compile && start cmd /k npm start"

   ```
   *
```ts
   "start cmd" //open new command prompt
   "/k"//execute command inside that new cmd
   ```
* #### this is the new script of npm run dev (using npm-run-all library)[run compile and app in the same window]
  
   ```json
        "dev": "npm-run-all --parallel compile start",    
   ```


## ================================
# Webhook
## ================================
> # Outlook webhoook 👂
> ## the process of subscribe (hook) to outlook user activities
> -  ### first create microsoft app at the [applcation Registeration Portal](https://apps.dev.microsoft.com/)
> -  ### get user authorization token using  [Oauth2.0 process](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-protocols-oauth-code)
> > <b>Improtant!!</b>
> > - make sure that when you redirect user to the login page the <b>scope </b> parameter -  will contain the scope of activities you want to listen to
> > - this scope should also be enabled in the [application  registeration portal ](https://apps.dev.microsoft.com/#/appList)
> - ### after you recevied the access token you can [send subscription request](https://msdn.microsoft.com/en-us/office/office365/api/notify-rest-operations#subscribe-to-changes-in-my-mail-calendar-contacts-or-tasks) in order to recieve notifications about the microsoft user activities , the request will contain  NotificationURL that tell microsoft where to send the notifications (user activities info)
```ts
//body when wanting to CREATE subscription to user activities
export interface iSubscriptionRequest {
    ChangeType: string,// "Created"; //	Indicates the type of events that will raise a notification- https://msdn.microsoft.com/en-us/office/office365/api/notify-rest-operations#changetype
    ClientState?: string//[Optional]  property that will be sent back in each notification event from microsoft graph (in the headers) (can be used to validate the notification legitimacy)
    NotificationURL: string;   //Specifies where notifications should be sent to (my resource)
    "@odata.type": string // "#Microsoft.OutlookServices.PushSubscription";
    Resource: string // "https://outlook.office.com/api/v2.0/me/messages";//Specifies the resource to monitor and receive notifications on (outlook/calander/onedrive/ etc..). (for example - https://outlook.office.com/api/v2.0/me/events -this for calander events) 
    ExpirationDateTime?: number//define when this subscription sould end - if not defiend - will be 1 day for reach sub/7 days for normal 
    
}

```
> > NOTES 
>>> * use **$select** if wanting to directly get notification Info (email message info)  "You can save a separate GET API call if you use a $select parameter in the subscription request and specify the properties you're interested in. The following is an example that requests a notification to include the subject property when an event has been created:" [more info here](https://msdn.microsoft.com/en-us/office/office365/api/notify-rest-operations#subscribe-to-changes-in-my-mail-calendar-contacts-or-tasks)

>>>* use **$filter** to get only specific notifications for example - get only notifications about emails with attachments 

> - ### microsoft will send a first request to the <b>*NotificationURL*</b> specified along with <b>*validationToken*</b> in order to validate that its a legit resource this route should return status 200 and a text/plain response with the validationToken 
> - ### after that - the subscription will be created and the [subscription ](https://msdn.microsoft.com/en-us/office/office365/api/notify-rest-operations#subscribe-to-changes-in-my-mail-calendar-contacts-or-tasks) Response will contain the<b> SubscriptionId </b>- so when notification will get   sent to the server the app will know which user that is
```ts
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
```
> - ### after you receiving the notification you can use the [office365 APIs](https://msdn.microsoft.com/en-us/office/office365/api/api-catalog) to get more info about it
> - ### more details about the process are mentioned [here](https://msdn.microsoft.com/en-us/office/office365/api/notify-rest-operations#subscribe-to-changes-in-my-mail-calendar-contacts-or-tasks)
---
> # Gmail Webhook 👂
> -  ### first create Google app at the [Google API Console](https://console.developers.google.com/) and [Enable the Gmail API](https://console.developers.google.com/apis/api/gmail.googleapis.com/overview)
> - ### in order to establish Gmail webhook for your app you need to be familiar with the [Cloud Pub/Sub API](https://cloud.google.com/pubsub/docs/overview)
> - ### Domain Verification - in order to use Webhook with Google pub/Sub we should prove ownership of the domain that receive the notifications - follow [this steps](https://cloud.google.com/pubsub/docs/push#other-endpoints) :
> >  1. verify domain from the [Search Conosole](https://www.google.com/webmasters/tools/home?hl=en) - you should downalod an html file that you will send back as response for the route '/<html_file_name>'
 
```ts  
router.get('/googlebdff09854abfa74b.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'googlebdff09854abfa74b.html'));
})
```
> >  2. add that domain to the in the [Google API Console](https://console.cloud.google.com/apis/credentials/domainverification)

> - ### fulfill the [Cloud Pub/Sub Prerequisites](https://cloud.google.com/pubsub/docs/quickstart-console) 


> -  ### get user authorization token using  [Oauth2.0 process](https://developers.google.com/actions/identity/oauth2-code-flow) (here is [recommended library for nodejs](https://github.com/google/google-api-nodejs-client))
> > <b>Improtant!!</b>
> > - make sure that in Oauth2.0 flow - when you redirect user to the login page the <b>[scope](https://developers.google.com/identity/protocols/googlescopes) </b> parameter -  will contain the scope of activities you want to listen to
> - ### after resolving the user access token you can now request to [watch user activities](https://developers.google.com/gmail/api/v1/reference/users/watch)<small> (equivalent to Outlook - CreateSubscription request )</small> along with  [**'me'**] as a value for the [**userId**] parameter, and the [topicName] youv'e created in the [Cloud Pub/Sub Prerequisites](https://cloud.google.com/pubsub/docs/quickstart-console) 
> > > #### NOTE - if receiving 403 it can beacuse one of the following:
>>> 1. you didnt enabled the [Google Cloud Pub/Sub API] OR the [Gmail API]  in the [google console ](https://console.developers.google.com/apis/library)
>>> 2. you didnt provided the scope premissions when authorazing with Oauth2.0: 'https://www.googleapis.com/auth/pubsub' , .... (look in :https://developers.google.com/gmail/api/v1/reference/users/watch)
>>>  3. you didnt grant publish priviliges to serviceAccount:gmail-api-push@system.gserviceaccount.com in the  IAM:    (https://developers.google.com/gmail/api/guides/push#grant_publish_rights_on_your_topic , https://console.cloud.google.com/iam-admin/iam  
>>> 4. the topicName you are trying to register to is deleted/mismatch
> - ### if the [watch user activities](https://developers.google.com/gmail/api/v1/reference/users/watch) succeded you will receive the following [response](https://developers.google.com/gmail/api/v1/reference/users/watch#response) body:
```ts
{
  historyId: 1234567890 //save it in order to pull more details about the notification later on. you will receive notifications that occured from that point in time (historyId =define point in time) 
  expiration: 1431990098200 // /*When Gmail will stop sending notifications for mailbox updates (epoch millis).Call watch again before this time to renew the watch.*/
}

```
> - ### now notifications will be sent to all the subscribers's urls <small>(for example :https://myserver/gmail/notification)</small> to the topicName specified in the [Watch] request , <small>(the subscription was created in the [Cloud Pub/Sub Prerequisites](https://cloud.google.com/pubsub/docs/quickstart-console) step) </small><br/>each notification body contain the following:
```ts
interface iGmailNotification {
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
``` 
> - ### NOTE - [return 200 for every notification received](https://developers.google.com/gmail/api/guides/push#responding_to_notifications)
> - ### now you can use the user access_token<small> (related to that user email) </small> in order to send [HistoryList](https://developers.google.com/gmail/api/v1/reference/users/history/list) request - that give more details about the user activities occurred.<br/>
>>>    * GET HistoryList Request that contains:
>>>  1. [URL PARAM] userId/'me' - the userId that we intersted to get the history about (= we will use the 'me' value)
>>> 2. [Query-Param] startHistoryId - [REQUIERD] will return history records after the specified startHistoryId   
>>> 3. [Query-Param] pageToken - Page token to retrieve a specific page of results in the list,when we'll recive the HistoryList we'll also get:
       a.nextPageToken - that indicates that not all activites has been recivied and to get the next chunk of history
       we should use this 'nextPageToken' and send it as a @param pageToken as a queryparam
       if nextPageToken doesnt exist it means we got all activities.
       b.[RELEVANT TO GDRIVE ] *newStartPageToken - indicates the moment (the begin point) from which we want to get the activities next time a push notification happends
    
                                            */
>> ### furtermore , use the [Gmail API](https://developers.google.com/gmail/api/v1/reference/) to get info about specific activity (notification) - for exmaple get message by id  , get message attachment etc..
> - ### more details about the process are mentioned [here] (https://developers.google.com/gmail/api/guides/push)
> # Gdrive Webhook 👂
> - ### the code in the gdrive section is not accurate but it can give a general understanding of the whole flow 
> - ### can find full info [here](https://developers.google.com/drive/v3/web/push).
## ================================
# NOTES
## ================================

> gmail webhook
* handle duplicated notifications received from gmail api 

⚡✔️