const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    author: {type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true},
    text: {type: String, required: true},
    posted: {type: Date, required: true}
})

module.exports = mongoose.model('Message', MessageSchema);