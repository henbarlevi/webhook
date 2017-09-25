/**https://developers.google.com/gmail/api/v1/reference/users/messages#resource */
export interface iGmailMessage {
    id: string,
    threadId: string,
    labelIds: string[]// [ SENT],
    snippet: string, //the content of the email message
    historyId: string,
    internalDate: string,
    payload:iPayload //The parsed email structure in the message parts.
 
}

export interface iPayload{
    partId: string,
    mimeType: string,
    filename: string,
    headers: [
      {
        name: string,
        value: string
      }
    ],
    body: {
        attachmentId?:string, //exsit if its an attachment (if filename != '' its part that describe attachment)
        size:number
    },
    parts: iPayload[]
}