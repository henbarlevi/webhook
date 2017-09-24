"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const config = require("config");
const gdrive_route_1 = require("./routes/gdrive.route");
const gmail_route_1 = require("./routes/gmail.route");
const logger_1 = require("./utils/logger");
const TAG = 'App';
const ENV = process.env.NODE_ENV || 'local';
const envConfig = config.get(`${ENV}`);
const connectionString = envConfig.connectionString || 'mongodb://localhost/mydb';
const BASE_URL = envConfig.base_url;
logger_1.Logger.d(TAG, '=================== App Config =================== ', 'yellow');
console.log('ENV >' + ENV);
logger_1.Logger.d(TAG, 'Server BASE URL > ' + BASE_URL, 'yellow');
console.log(envConfig);
logger_1.Logger.d(TAG, '=================== / App Config =================== ', 'yellow');
//const connectionString: string = process.env.DB_CONNECTION_STRING || 'mongodb://localhost/mydb';
// Creates and configures an ExpressJS web server.
class App {
    //Run configuration methods on the Express instance.
    constructor() {
        this.express = express(); //THE APP
        this.middleware();
        this.routes();
    }
    // Configure Express middleware.
    middleware() {
        mongoose.connect(connectionString);
        this.express.use(logger('dev'));
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
        this.express.use(express.static(path.join(__dirname, './dist/public'))); //handle request for static files - client will get all files from the 'public' folder
    }
    // Configure API endpoints.
    routes() {
        /* This is just to get up and running, and to make sure what we've got is
         * working so far. This function will change when we start to add more
         * API endpoints */
        this.express.use('/', gdrive_route_1.default);
        this.express.use('/gmail', gmail_route_1.default);
    }
}
exports.default = new App().express; //export instance of new app
