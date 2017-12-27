


import * as config from 'config';
import * as request from 'request';
// =============
// ====== models
// =============

// =============
// ====== utils
// =============
import { Logger } from '../utils/Logger';
const TAG: string = 'GsuiteService |';

const ENV: string = process.env.NODE_ENV || 'local';
const envConfig: any = config.get(ENV);
// ===================================
//setting google app creds for 
// ===================================

const gsuite = envConfig.gsuite;
const app_name: string = gsuite.app_name;
//const client_id: string = gsuite.client_id;
const client_secret: string = gsuite.client_secret;
const redirect_uri: string = gsuite.redirect_uri;
const scope: string = gsuite.scope;
//service_account Creds [Gsuite domain-wide authority]:
const service_account = gsuite.service_account
const type = service_account.type; //"service_account"
const project_id = service_account.project_id; //"gmail-webhook-tst",
const private_key_id = service_account.private_key_id;// "80f99b1a13a2c2ea6711b1f7d702b80b8f148672",
const private_key = service_account.private_key; //"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC1TRHGAgWBQtqe\n9ZWk0t73gtCiKdECFcyPhpzBX35yEEEEufPsXUECSi3T+fGcSD1d2j4L/tG9YprN\nHDakfZX3ae7MR+TileB2tSXzP+XtQe1yQMHQV2q/eKrfPp7LeSuSyNxUpZ544X/l\nLCeJykLTj3vY5InwWaaG6SESXIWX6Xl49h+u+OCChNYTCJw2iH8RJaDznjlWnD6i\n3YwzcNIFO5utSkQdSrkiSEoqtBkeb4HbRwzg0SFTYk4iyvsVpbJ5c9gR0QZ98Pbn\nbgy0S6gK+a+4Iw2w/cyYRHE2e0cUwEaclcwkS+eMTDAs5BxVxmWfjvuUIsXBgxO4\nGODorQqnAgMBAAECggEAIbjqG2h42agzvel0IipO6r7cS613gOnJGNEzCwzWGiVH\n0rc71bUqyGA/0fPlquoM8A4OCHEnVhCnNouO5l2trU1462pb+oFiNPJQ0sQJ4m2m\n2t+MrVH1OxQYxFmDc9lf73eI8/2yUk2vWlMyL4D9mRhRMvCfb6NdRC7MxfuLpcup\nSTNc/qbQZETfjRCRRzVgRMp12N8bMQA9tmn/OzFGYWqqPc75PrYZjuWdqHl/lfH6\nbQt8oMiGIH6GODIb6KEWhg6cWqWpn2ldb1UCapM11d8CfVxlYNMhdP2UWpWpCxct\nDmZD02cfl1U0oQeD6EsIBlo25ZPNsmel6zu0jCK10QKBgQDmEdwytQOtKVn41A9G\nlV9QFXgD1blO9suAAPMcPEof/3l46v3iwDuxgk2jvGPusITng6BIQV7wAAFmE5+t\nDyNc9CqsfHIjgeRA/U+6muyYud4ZXlHi6VzmwOd1cPZUBS3v7GL/MBNdJejb2w61\nkKiG/G3PcT48qCg088CpoqxVQwKBgQDJvBlVZGTcbJZvKTbxlhnHp9PdJCynK14F\n8AC/aFW/B0pasfnoswzBi5VqHVoI7Hn9G9fKdJSH6WUMtikpFymvt1P0vrMtpBPV\nRm3ARzP1IIk++spuazbWd1Ng/fggMmLqar3ygqulcH5hFU5jdLSw3k4LweVuzThB\nCETmVvHszQKBgQCwqDIeNWPXSJMvPxVjqzp+cZ2vxCIAAfyMEy6ZFaoNG8uYD0hX\nHig3ysf226cYFi5W3njqQle1jSuFx7ep2J/cthc2TnAN16T+SgM4U9EsDDv/2q6h\nv3J4NNMFGHHsXfXB7g6tx6p2sa81ceS/gY4F6DohOOEDDlOhJTFgj+onpQKBgATX\ni/AdwcH8pTuzzIrN5H6DS7WCGcRFaTNRSGNPuMcmAKXeobXxHjxDAmoSnEecjW0C\nzxIf7DS66F7+vEwtLyX1i4FTVm+hAYzb7ORxkRCwIDsvv84Yqq9JG+o3Dk6PhwpD\nV53Lfx0wbwgbf88pTPD11P+5Pq2DJXeCIE07BwF9AoGAS8cMPJScqt03PZ0X9hMd\nlpK3RswnstutFUfr5gCZbKumj4EvimxJHgcqjlbln9fA+2y4IKHEHLjCqVStM55H\n6XhMw7rY873Sj4r1H6pq4K+JAE7U10PciImNPf8eHdVFMQgHfgO0YiBCk3dlMzkZ\nhFt2IBpYNBlcZ6A11bIhhIM=\n-----END PRIVATE KEY-----\n",
const client_email = service_account.client_email;// "gsuite-domainwide-access-servi@gmail-webhook-tst.iam.gserviceaccount.com",
const client_id = service_account.client_id// "116933778058666551213",
const auth_uri = service_account.auth_uri  // "https://accounts.google.com/o/oauth2/auth",
const token_uri = service_account.token_uri       // "https://accounts.google.com/o/oauth2/token",
const auth_provider_x509_cert_url = service_account.auth_provider_x509_cert_url;      // "https://www.googleapis.com/oauth2/v1/certs",
const client_x509_cert_url = service_account.client_x509_cert_url;   // "https://www.googleapis.com/robot/v1/metadata/x509/gsuite-domainwide-access-servi%40gmail-webhook-tst.iam.gserviceaccount.com"
//webhook :
const topicName: string = gsuite.webhook.topicName;

// ===================================
//set up google sdk :
// ===================================
import * as  google from 'googleapis';//google sdk for api+Oauth
import { iGoogleToken } from '../gmail/models/iGoogleToken.model';
//creating JWT auth client for service account:

let jwtClient = new google.auth.JWT(
  client_email,//service account email
  null,
  private_key,/** Contents of private_key.pem if you want to load the pem file yourself (do not use the path parameter above if using this param) */
  scope, // an array of auth scopes
  'hen@shieldox.com' // User to impersonate (leave empty if no impersonation needed)  'subject-account-email@example.com'
);



export class GsuiteService {


  static getUsers(domain?:string) {
    //https://www.googleapis.com/admin/directory/v1/users
    return new Promise(async (resolve, reject) => {
      let tokens = await this.getServiceAccountTokens();

      /**
       * NOTE - (for investigation) 
       * when returning by 'shieldox' domain it returns [29] users
       * when returning by 'probot.ai' domain it returns [15] users
       * when returning by customer=${'my_customer'} (using an impersonate super admin) it returns [54]
       */
      let url = `https://www.googleapis.com/admin/directory/v1/users?domain=${domain}`;//domain=${'shieldox.com'}//customer=${'my_customer'}
      let headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tokens.access_token}`
      }
      Logger.d(TAG, `*** getting all users of a company , url >${url} ***`, 'gray');
      request.get({
        url: url,
        json: true,
        headers: headers,
      }, (err, res, body: {}) => {
        console.log(body);
        this.handleResponse(err, res, body, resolve, reject);
      });


    })
  }
  static getDomains() {
    //https://www.googleapis.com/admin/directory/v1/users
    return new Promise(async (resolve, reject) => {
      let tokens = await this.getServiceAccountTokens();

      /**
       * NOTE - (for investigation) 
       * when returning by 'shieldox' domain it returns [29] users
       * when returning by 'probot.ai' domain it returns [15] users
       * when returning by customer=${'my_customer'} (using an impersonate super admin) it returns [54] - return all users in the company
       */
      let url = `https://www.googleapis.com/admin/directory/v1/customer/my_customer/domains`;//domain=${'shieldox.com'}//customer=${'my_customer'}
      let headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tokens.access_token}`
      }
      Logger.d(TAG, `*** getting all domains of a company , url >${url} ***`, 'gray');
      request.get({
        url: url,
        json: true,
        headers: headers,
      }, (err, res, body: {}) => {
        //console.log(body);
        this.handleResponse(err, res, body, resolve, reject);
      });


    })
  }
   static getServiceAccountTokens(impersonateEmail:string='hen@shieldox.com'): Promise<iGoogleToken> {
    return new Promise((res, rej) => {
      let tokens: iGoogleToken;
      jwtClient = new google.auth.JWT(
        client_email,//service account email
        null,
        private_key,/** Contents of private_key.pem if you want to load the pem file yourself (do not use the path parameter above if using this param) */
        scope, // an array of auth scopes
        impersonateEmail // User to impersonate (leave empty if no impersonation needed)  'subject-account-email@example.com'
      );
      jwtClient.authorize((err, tokens) => {
        if (err) {
          Logger.d(TAG, err, 'red');
          return rej(err)
        } else {
          tokens = tokens
          Logger.d(TAG, tokens, 'green');
          Logger.d(TAG, JSON.stringify(tokens), 'green');
          res(tokens);
        }
      });
    })

  }
  private static handleResponse(err, res, body, resolve, reject) {
    if (!res) {
      Logger.d(TAG, 'ERR ==========>server is Probably Down !', 'red');
      return reject(502);
    }
    if (err) {
      Logger.d(TAG, `ERR ==========>${err}`, 'red');
      return reject(err);
    }
    if (res.statusCode > 204) {
      Logger.d(TAG, `ERR ==========>${res.statusCode}${JSON.stringify(body)}`, 'red');
      return reject(res.statusCode);
    }
    resolve(body);
  }


}