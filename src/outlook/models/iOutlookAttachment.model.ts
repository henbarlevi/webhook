//https://msdn.microsoft.com/en-us/office/office365/api/complex-types-for-mail-contacts-calendar#attachment

//the response body when requesting GET Message Attachment using outlook mail API
export interface iOutlookAttachmentResponse {
    "@odata.context": string //url that contain the messageId the attachments related to//'https://outlook.office.com/api/v2.0/$metadata#Me/Messages(\'AAMkAGFlOWFlNDExLTY1MGMtNDEyOC05NmY0LWM4MjI2ODUxNTU4MwBGAAAAAAC7EJqCRBR1RJ-JHt_zPrEsBwCvmaYFS5MVS547IzU3pvYwAAAAAAEJAACvmaYFS5MVS547IzU3pvYwAAAAjNNlAAA%3D\')/Attachments'
    value: iOutlookAttachment[]
}

export interface iOutlookAttachment {
    "@odata.type":string //defince what type of attachment it is
    "@odata.id":string // url that contains the messageId and AttachmentId // https://outlook.office.com/api/v2.0/Users('6c4d5e1e-c8fd-47ac-9d22-c5e8dc56594e@65a1678f-e343-44a5-8c41-c51024828e11')/Messages('AAMkAGFlOWFlNDExLTY1MGMtNDEyOC05NmY0LWM4MjI2ODUxNTU4MwBGAAAAAAC7EJqCRBR1RJ-JHt_zPrEsBwCvmaYFS5MVS547IzU3pvYwAAAAAAEJAACvmaYFS5MVS547IzU3pvYwAAAAjNNoAAA=')/Attachments('AAMkAGFlOWFlNDExLTY1MGMtNDEyOC05NmY0LWM4MjI2ODUxNTU4MwBGAAAAAAC7EJqCRBR1RJ-JHt_zPrEsBwCvmaYFS5MVS547IzU3pvYwAAAAAAEJAACvmaYFS5MVS547IzU3pvYwAAAAjNNoAAABEgAQAPoyS5IEJuJBiUD5k0IDszA=')
    Id: String,	//The attachment ID.// Writeable? 	No    
    ContentType: String,//	The content type of the attachment.// Writeable? 	Yes // application/vnd.openxmlformats-officedocument.wordprocessingml.document
    LastModifiedDateTime: string,//	datetimeoffset	The date and time when the attachment was last modified.// Writeable? 	No // '2017-11-23T10:24:21Z'

}

export interface iOutlookFileAttachment extends iOutlookAttachment {
    "@odata.type":"#Microsoft.OutlookServices.FileAttachment"
    ContentBytes: string,//	binary	The binary contents of the file.// Writeable? 	No
    ContentId: string	//The ID of the attachment in the Exchange store.// Writeable? 	No
    ContentLocation: string,//	The Uniform Resource Identifier (URI) that corresponds to the location of the content of the attachment.	No
    ContentType: String,//	The content type of the attachment.// Writeable? 	Yes
    IsInline: boolean//	Set to true if this is an inline attachment.// Writeable? 	Yes
    Name: String//	The name representing the text that is displayed below the icon representing the embedded attachment.This does not need to be the actual file name.Yes
    Size: number //Int32	The size in bytes of the attachment. // Writeable? No
}

//A message, contact, or event that's attached to another message, event, or task
export interface iOutlookItemAttachment extends iOutlookAttachment{
    Item: iItem |any,//	The attached message or event. Navigation property.	Yes
    IsInline: boolean,//	boolean	Set to true if the attachment is inline, such as an embedded image within the body of the item.Yes
    Name: String,	//The display name of the attachment.Yes
    Size: number,//	Int32	The size in bytes of the attachment.Yes
}

export interface iItem{

}