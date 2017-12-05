import * as path from 'path';
import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import * as config from 'config';

import outlookRoutes from './outlook/routes/outlook.route';
import gmailRoutes from './gmail/routes/gmail.route';
import GoogleDomainVerification from './gmail/routes/domainVerification.route';

//===== utils
import { Logger } from './utils/Logger';
const TAG:string = 'App.ts';

const ENV: string = process.env.NODE_ENV || 'local';
const envConfig : any= config.get(`${ENV}`);
const connectionString: string = envConfig.connectionString || 'mongodb://localhost/mydb';
Logger.d(TAG,`============== ENV Configuration ==============`,'yellow');
console.log(`ENV = `+ENV)
console.log(envConfig);
Logger.d(TAG,`============== / ENV Configuration ============`,'yellow');



// Creates and configures an ExpressJS web server.
class App {

  // ref to Express instance
  public express: express.Application;

  //Run configuration methods on the Express instance.
  constructor() {
    this.express = express(); //THE APP
    this.middleware();
    this.routes();

  }

  // Configure Express middleware.
  private middleware(): void {
    //mongoose.connect(connectionString);

    //this.express.use(logger('dev'));
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));

  }

  // Configure API endpoints.
  private routes(): void {
    //echo
    this.express.get('/',(req:express.Request,res:express.Response)=>{ res.send(`welcome to mail webhook server api (ENV = ${ENV})`);})
    /* This is just to get up and running, and to make sure what we've got is
     * working so far. This function will change when we start to add more
     * API endpoints */
    this.express.use('/outlook', outlookRoutes);
    this.express.use('/gmail', gmailRoutes);
    //extra step for using webhooks Pub/Sub with google:
    this.express.use('/',GoogleDomainVerification);
  }



}

export default new App().express; //export instance of new app