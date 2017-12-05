
//response when requesting GET HistoryList of Gmail Activities
//https://developers.google.com/gmail/api/v1/reference/users/history/list

export interface iGmailHistory {
    history: iGmailHistoryFregment[]
    nextPageToken?: string,//if nextPageToken not exist (reached to the end of the updates)
    historyId/* we need to store this historyId for the next GET HistoryDetails for that user*/

}

export interface iGmailHistoryFregment {
    "id": Number,//The mailbox sequence ID.
    "messages": [{id:string,threadId:string}],/*List of messages changed in this history record. 
                        The fields for specific change types, such as messagesAdded may duplicate messages in this field. 
                        We recommend using the specific change-type fields instead of this.*/
    "messagesAdded": [{id:string,threadId:string}],//	Messages added to the mailbox in this history record.
    "messagesDeleted": [{id:string,threadId:string}],
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