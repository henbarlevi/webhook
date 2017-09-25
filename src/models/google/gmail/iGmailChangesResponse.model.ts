/**the response when requesting user's Gmail history: list  
 * https://developers.google.com/gmail/api/v1/reference/users/history/list
*/
export interface iGmailChangesResponse{
    history: [
      {
        id:string,
        messages: [{id:string,threadId:string}],//each element contiain {"id":string,threadId:string} of a message
        "messagesAdded": [
          {
            "message": users.messages Resource
          }
        ],
        "messagesDeleted": [
          {
            "message": users.messages Resource
          }
        ],
        "labelsAdded": [
          {
            "message": users.messages Resource,
            "labelIds": [
              string
            ]
          }
        ],
        "labelsRemoved": [
          {
            "message": users.messages Resource,
            "labelIds": [
              string
            ]
          }
        ]
      }
    ],
    nextPageToken: string,
    historyId:string //if nextPageToken not exist (reached to the end of the updates), we need to store this historyId for the next get changes request for that user
  }