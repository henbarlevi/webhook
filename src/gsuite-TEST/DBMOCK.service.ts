//instead of real db

let userByEmail= {}; //MOCK DB for access_token and historyId per email (user)

export class DBMOCK{
    static setToken(email:string,access_token:string){
        if(!userByEmail[email]){userByEmail[email]={}}
        userByEmail[email]['access_token']=access_token;
    }
    static getToken(email:string){
        if(!userByEmail[email]){userByEmail[email]={}}
        return userByEmail[email]['access_token'];
    }
    static getallusers(){
        return userByEmail;
    }
    static setHistoryId(historyId:string,email:string){
        if(!userByEmail[email]){userByEmail[email]={}}
        userByEmail[email]['historyId']=historyId;
    }
    static getHistoryId(email:string){
        if(!userByEmail[email]){userByEmail[email]={}}
        return userByEmail[email]['historyId'];
    }
}