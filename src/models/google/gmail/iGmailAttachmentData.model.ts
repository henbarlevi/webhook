/**https://developers.google.com/gmail/api/v1/reference/users/messages/attachments#resource
 * when getting attachment of a file
 */
export interface iGmailAttachmentData{
    /*The body data of a MIME message part as a base64url encoded string.
     May be empty for MIME container types that have no message body or when the body data is sent as a separate attachment.
     An attachment ID is present if the body data is contained in a separate attachment.*/
    data:string,
    /**Number of bytes for the message part data (encoding notwithstanding). */
    size:string
}