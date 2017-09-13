"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const schema = new Schema({
    gdrive: {
        id: String,
        token: String,
        email: String,
        name: String
    }
});
const User = mongoose.model('User', schema);
exports.User = User;
