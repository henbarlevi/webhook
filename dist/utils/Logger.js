"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const colors = require("colors");
const isLog = process.env.ENV != 'dev' && process.env.ENV != 'prod';
class Logger {
    static d(tag, msg, color) {
        if (isLog) {
            if (color) {
                console.log(tag, colors[color](msg));
            }
            else {
                console.log(tag, msg);
            }
        }
    }
    static e(tag, msg, err) {
        if (isLog) {
            console.log(tag, msg, err);
        }
    }
}
exports.Logger = Logger;
