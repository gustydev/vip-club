const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const luxon = require('luxon');

const MessageSchema = new Schema({
    author: {type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true},
    text: {type: String, required: true},
    posted: {type: Date, required: true}
})

MessageSchema.virtual('dateFormatted').get(function() {
    return this.posted.toLocaleString();
})
module.exports = mongoose.model('Message', MessageSchema);