import * as path from 'path';
import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import * as config from 'config';

import GdriveRoutes from './routes/gdrive.route';
import GmailRoutes from './routes/gmail.route';

import { Logger } from './utils/logger'
const TAG = 'App';
const ENV: string = process.env.NODE_ENV || 'local';
const envConfig: any = config.get(`${ENV}`);
const connectionString: string = envConfig.connectionString || 'mongodb://localhost/mydb';
const BASE_URL: string = <string>envConfig.base_url;
Logger.d(TAG, '=================== App Config =================== ','yellow');
console.log('ENV >' + ENV);
Logger.d(TAG, 'Server BASE URL > ' + BASE_URL, 'yellow');
console.log(envConfig);
Logger.d(TAG, '=================== / App Config =================== ','yellow');

//const connectionString: string = process.env.DB_CONNECTION_STRING || 'mongodb://localhost/mydb';

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
    mongoose.connect(connectionString);

    this.express.use(logger('dev'));
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this.express.use(express.static(path.join(__dirname, './dist/public')));//handle request for static files - client will get all files from the 'public' folder
  }

  // Configure API endpoints.
  private routes(): void {
    /* This is just to get up and running, and to make sure what we've got is
     * working so far. This function will change when we start to add more
     * API endpoints */
    this.express.use('/', GdriveRoutes);
    this.express.use('/gmail', GmailRoutes);
    
  }



}

export default new App().express; //export instance of new app