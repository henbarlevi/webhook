//response when requesting GET Message with outlook API
export interface iOutlookMessage{
        "@odata.context":string// "https://outlook.office.com/api/v2.0/$metadata#Me/Messages/$entity",
        "@odata.id":string //"https://outlook.office.com/api/v2.0/Users('ddfcd489-628b-40d7-b48b-57002df800e5@1717622f-1d94-4d0c-9d74-709fad664b77')/Messages('AAMkAGI2THVSAAA=')",
        "@odata.etag":string // "W/\"CQAAABYAAACd9nJ/tVysQos2hTfspaWRAAADTIKz\"",
        "Id":string // "AAMkAGI2THVSAAA=",
        "CreatedDateTime":string // "2014-10-20T00:41:57Z",
        "LastModifiedDateTime":string // "2014-10-20T00:41:57Z",
        "ChangeKey":string // "CQAAABYAAACd9nJ/tVysQos2hTfspaWRAAADTIKz",
        "Categories":string // [],
        "ReceivedDateTime":string // "2014-10-20T00:41:57Z",
        "SentDateTime":string // "2014-10-20T00:41:53Z",
        "HasAttachments": boolean,
        "Subject":string // "Re: Meeting Notes",
        "Body": {
            "ContentType":string // "Text",
            "Content":string // "\n________________________________________\nFrom: Alex D\nSent: Sunday, October 19, 2014 5:28 PM\nTo: Katie Jordan\nSubject: Meeting Notes\n\nPlease send me the meeting notes ASAP\n"
        },
        "BodyPreview":string // "________________________________________\nFrom: Alex D\nSent: Sunday, October 19, 2014 5:28 PM\nTo: Katie Jordan\nSubject: Meeting Notes\n\nPlease send me the meeting notes ASAP",
        "Importance":string // "Normal",
        "ParentFolderId":string // "AAMkAGI2AAEMAAA=",
        "Sender": {
            "EmailAddress": {
                "Name":string // "Katie Jordan",
                "Address":string // "katiej@a830edad9050849NDA1.onmicrosoft.com"
            }
        },
        "From": {
            "EmailAddress": {
                "Name":string // "Katie Jordan",
                "Address":string // "katiej@a830edad9050849NDA1.onmicrosoft.com"
            }
        },
        "ToRecipients": [
            {
                "EmailAddress": {
                    "Name":string // "Alex D",
                    "Address":string // "alexd@a830edad9050849NDA1.onmicrosoft.com"
                }
            }
        ],
        "CcRecipients": string[],
        "BccRecipients": string[],
        "ReplyTo": any[],
        "ConversationId":string // "AAQkAGI2yEto=",
        "IsDeliveryReceiptRequested": boolean,
        "IsReadReceiptRequested": boolean,
        "IsRead": boolean,
        "IsDraft": boolean,
        "WebLink":string // "https://outlook.office365.com/owa/?ItemID=AAMkAGI2THVSAAA%3D&exvsurl=1&viewmodel=ReadMessageItem"
    }




/**EXAMPLE */
/**
 * {
    "@odata.context": "https://outlook.office.com/api/v2.0/$metadata#Me/Messages/$entity",
    "@odata.id": "https://outlook.office.com/api/v2.0/Users('ddfcd489-628b-40d7-b48b-57002df800e5@1717622f-1d94-4d0c-9d74-709fad664b77')/Messages('AAMkAGI2THVSAAA=')",
    "@odata.etag": "W/\"CQAAABYAAACd9nJ/tVysQos2hTfspaWRAAADTIKz\"",
    "Id": "AAMkAGI2THVSAAA=",
    "CreatedDateTime": "2014-10-20T00:41:57Z",
    "LastModifiedDateTime": "2014-10-20T00:41:57Z",
    "ChangeKey": "CQAAABYAAACd9nJ/tVysQos2hTfspaWRAAADTIKz",
    "Categories": [],
    "ReceivedDateTime": "2014-10-20T00:41:57Z",
    "SentDateTime": "2014-10-20T00:41:53Z",
    "HasAttachments": true,
    "Subject": "Re: Meeting Notes",
    "Body": {
        "ContentType": "Text",
        "Content": "\n________________________________________\nFrom: Alex D\nSent: Sunday, October 19, 2014 5:28 PM\nTo: Katie Jordan\nSubject: Meeting Notes\n\nPlease send me the meeting notes ASAP\n"
    },
    "BodyPreview": "________________________________________\nFrom: Alex D\nSent: Sunday, October 19, 2014 5:28 PM\nTo: Katie Jordan\nSubject: Meeting Notes\n\nPlease send me the meeting notes ASAP",
    "Importance": "Normal",
    "ParentFolderId": "AAMkAGI2AAEMAAA=",
    "Sender": {
        "EmailAddress": {
            "Name": "Katie Jordan",
            "Address": "katiej@a830edad9050849NDA1.onmicrosoft.com"
        }
    },
    "From": {
        "EmailAddress": {
            "Name": "Katie Jordan",
            "Address": "katiej@a830edad9050849NDA1.onmicrosoft.com"
        }
    },
    "ToRecipients": [
        {
            "EmailAddress": {
                "Name": "Alex D",
                "Address": "alexd@a830edad9050849NDA1.onmicrosoft.com"
            }
        }
    ],
    "CcRecipients": [],
    "BccRecipients": [],
    "ReplyTo": [],
    "ConversationId": "AAQkAGI2yEto=",
    "IsDeliveryReceiptRequested": false,
    "IsReadReceiptRequested": false,
    "IsRead": false,
    "IsDraft": false,
    "WebLink": "https://outlook.office365.com/owa/?ItemID=AAMkAGI2THVSAAA%3D&exvsurl=1&viewmodel=ReadMessageItem"
}


ANOTHER ONE
{ '@odata.context': 'https://outlook.office.com/api/v2.0/$metadata#Me/Messages/$entity',
  '@odata.id': 'https://outlook.office.com/api/v2.0/Users(\'6c4d5e1e-c8fd-47ac-9d22-c5e8dc56594e@65a1678f-e343-44a5-8c41-c51024828e11\')/Messages(\'AAMkAGFlOWFlNDExLTY1MGMtNDEyOC05NmY0LWM4MjI2ODUxNTU4MwBGAAAAAAC7EJqCRBR1RJ-JHt_zPrEsBwCvmaYFS5MVS547IzU3pvYwAAAAAAEJAACvmaYFS5MVS547IzU3pvYwAAAAjNNhAAA=\')',
  '@odata.etag': 'W/"CQAAABYAAACvmaYFS5MVS547IzU3pvYwAAAAjOxs"',
  Id: 'AAMkAGFlOWFlNDExLTY1MGMtNDEyOC05NmY0LWM4MjI2ODUxNTU4MwBGAAAAAAC7EJqCRBR1RJ-JHt_zPrEsBwCvmaYFS5MVS547IzU3pvYwAAAAAAEJAACvmaYFS5MVS547IzU3pvYwAAAAjNNhAAA=',
  CreatedDateTime: '2017-11-23T09:11:41Z',
  LastModifiedDateTime: '2017-11-23T09:11:42Z',
  ChangeKey: 'CQAAABYAAACvmaYFS5MVS547IzU3pvYwAAAAjOxs',
  Categories: [],
  ReceivedDateTime: '2017-11-23T09:11:42Z',
  SentDateTime: '2017-11-23T09:11:41Z',
  HasAttachments: false,
  InternetMessageId: '<AM5P190MB040469E3F8155EF878A0A68BDE210@AM5P190MB0404.EURP190.PROD.OUTLOOK.COM>',
  Subject: 'saasadasdasd',
  BodyPreview: 'vvvvvvvvvvvvvvv',
  Importance: 'Normal',
  ParentFolderId: 'AAMkAGFlOWFlNDExLTY1MGMtNDEyOC05NmY0LWM4MjI2ODUxNTU4MwAuAAAAAAC7EJqCRBR1RJ-JHt_zPrEsAQCvmaYFS5MVS547IzU3pvYwAAAAAAEJAAA=',
  ConversationId: 'AAQkAGFlOWFlNDExLTY1MGMtNDEyOC05NmY0LWM4MjI2ODUxNTU4MwAQAPGGEbu3G35FvObHiq_x-3U=',
  IsDeliveryReceiptRequested: false,
  IsReadReceiptRequested: false,
  IsRead: true,
  IsDraft: false,
  WebLink: 'https://outlook.office365.com/owa/?ItemID=AAMkAGFlOWFlNDExLTY1MGMtNDEyOC05NmY0LWM4MjI2ODUxNTU4MwBGAAAAAAC7EJqCRBR1RJ%2FJHt%2BzPrEsBwCvmaYFS5MVS547IzU3pvYwAAAAAAEJAACvmaYFS5MVS547IzU3pvYwAAAAjNNhAAA%3D&exvsurl=1&viewmodel=ReadMessageItem',
  InferenceClassification: 'Focused',
  Body:
   { ContentType: 'HTML',
     Content: '<html>\r\n<head>\r\n<meta http-equiv="Content-Type" content="text/html; charset=utf-8">\r\n<meta content="text/html; charset=iso-8859-1">\r\n<style type="text/css" style="display:none">\r\n<!--\r\np\r\n\t{margin-top:0;\r\n\tmargin-bottom:0}\r\n-->\r\n</style>\r\n</head>\r\n<body dir="ltr">\r\n<div id="divtagdefaultwrapper" dir="ltr" style="font-size:12pt; color:#000000; font-family:Calibri,Helvetica,sans-serif">\r\n<p>vvvvvvvvvvvvvvv</p>\r\n</div>\r\n</body>\r\n</html>\r\n' },
  Sender: { EmailAddress: { Name: 'Hen', Address: 'hen@shieldox.com' } },
  From: { EmailAddress: { Name: 'Hen', Address: 'hen@shieldox.com' } },
  ToRecipients: [ { EmailAddress: [Object] } ],
  CcRecipients: [],
  BccRecipients: [],
  ReplyTo: [] }


EXAMPLE WITH ATTACHMENTS:

  { '@odata.context': 'https://outlook.office.com/api/v2.0/$metadata#Me/Messages/$entity',
  '@odata.id': 'https://outlook.office.com/api/v2.0/Users(\'6c4d5e1e-c8fd-47ac-9d22-c5e8dc56594e@65a1678f-e343-44a5-8c41-c51024828e11\')/Messages(\'AAMkAGFlOWFlNDExLTY1MGMtNDEyOC05NmY0LWM4MjI2ODUxNTU4MwBGAAAAAAC7EJqCRBR1RJ-JHt_zPrEsBwCvmaYFS5MVS547IzU3pvYwAAAAAAEJAACvmaYFS5MVS547IzU3pvYwAAAAjNNjAAA=\')',
  '@odata.etag': 'W/"CQAAABYAAACvmaYFS5MVS547IzU3pvYwAAAAjOxw"',
  Id: 'AAMkAGFlOWFlNDExLTY1MGMtNDEyOC05NmY0LWM4MjI2ODUxNTU4MwBGAAAAAAC7EJqCRBR1RJ-JHt_zPrEsBwCvmaYFS5MVS547IzU3pvYwAAAAAAEJAACvmaYFS5MVS547IzU3pvYwAAAAjNNjAAA=',
  CreatedDateTime: '2017-11-23T09:28:16Z',
  LastModifiedDateTime: '2017-11-23T09:28:44Z',
  ChangeKey: 'CQAAABYAAACvmaYFS5MVS547IzU3pvYwAAAAjOxw',
  Categories: [],
  ReceivedDateTime: '2017-11-23T09:28:43Z',
  SentDateTime: '2017-11-23T09:28:43Z',
  HasAttachments: true,
  InternetMessageId: '<AM5P190MB040427A7EC46AF9CE18B180CDE210@AM5P190MB0404.EURP190.PROD.OUTLOOK.COM>',
  Subject: 'WITH ATTACHMENTS 4444444444444444444444422222222',
  BodyPreview: '',
  Importance: 'Normal',
  ParentFolderId: 'AAMkAGFlOWFlNDExLTY1MGMtNDEyOC05NmY0LWM4MjI2ODUxNTU4MwAuAAAAAAC7EJqCRBR1RJ-JHt_zPrEsAQCvmaYFS5MVS547IzU3pvYwAAAAAAEJAAA=',
  ConversationId: 'AAQkAGFlOWFlNDExLTY1MGMtNDEyOC05NmY0LWM4MjI2ODUxNTU4MwAQAHRTrFUI0vhPokQ2Dx5fedM=',
  IsDeliveryReceiptRequested: false,
  IsReadReceiptRequested: false,
  IsRead: true,
  IsDraft: false,
  WebLink: 'https://outlook.office365.com/owa/?ItemID=AAMkAGFlOWFlNDExLTY1MGMtNDEyOC05NmY0LWM4MjI2ODUxNTU4MwBGAAAAAAC7EJqCRBR1RJ%2FJHt%2BzPrEsBwCvmaYFS5MVS547IzU3pvYwAAAAAAEJAACvmaYFS5MVS547IzU3pvYwAAAAjNNjAAA%3D&exvsurl=1&viewmodel=ReadMessageItem',
  InferenceClassification: 'Focused',
  Body:
   { ContentType: 'HTML',
     Content: '<html>\r\n<head>\r\n<meta http-equiv="Content-Type" content="text/html; charset=utf-8">\r\n<meta content="text/html; charset=iso-8859-1">\r\n<style type="text/css" style="display:none">\r\n<!--\r\np\r\n\t{margin-top:0;\r\n\tmargin-bottom:0}\r\n-->\r\n</style>\r\n</head>\r\n<body dir="ltr">\r\n<div id="divtagdefaultwrapper" dir="ltr" style="font-size:12pt; color:#000000; font-family:Calibri,Helvetica,sans-serif">\r\n<p><br>\r\n</p>\r\n</div>\r\n</body>\r\n</html>\r\n' },
  Sender: { EmailAddress: { Name: 'Hen', Address: 'hen@shieldox.com' } },
  From: { EmailAddress: { Name: 'Hen', Address: 'hen@shieldox.com' } },
  ToRecipients: [ { EmailAddress: [Object] } ],
  CcRecipients: [],
  BccRecipients: [],
  ReplyTo: [] }
 */