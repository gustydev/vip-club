const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstname: {type: String, required: true, min: 1},
    lastname: {type: String},
    password: {type: String, required: true},
    joined: {type: Date, required: true},
    vip: {type: Boolean, required: true},
    admin: {type: Boolean}
})

UserSchema.virtual('fullname').get(function () {
    return `${this.firstname} ${this.lastname}`;
})

module.exports = mongoose.model('User', UserSchema);