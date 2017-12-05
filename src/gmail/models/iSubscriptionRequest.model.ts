/**
 *Request body when wanting to subscribe to user Gmail activities 
 * https://developers.google.com/gmail/api/v1/reference/users/watch*/
export interface iSubscriptionRequest{
    labelIds?:string[],/**[Optional] List of label_ids to restrict notifications about. By default, if unspecified, all changes are pushed out.
     If specified then dictates which labels are required for a push notification to be generated. */
     labelFilterAction?:string,/**[Optional] Filtering behavior of labelIds list specified.    
     Acceptable values are:
     "exclude"
     "include"
      */
      topicName:string/**[Requierd] user gmail activities will sent to all the subscription that subscribe to that topic name 
      (topics and subs are created and handled here : https://console.cloud.google.com/projectselector/cloudpubsub/topicList*/
}