import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;


const schema = new Schema({
    gdrive: {
        id: String,
        token: String,
        email: String,
        name: String
    }
    
});

const User = mongoose.model('User',schema);
export {User}