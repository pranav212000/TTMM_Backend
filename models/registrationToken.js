const mongoose = require('mongoose');
const constants = require('../constants');


Schema = mongoose.Schema;

TokenSchema = new Schema({
    [constants.phoneNumber]: { type: String, required: [true, 'Phone Number is required'], unique: true },
    [constants.token]: { type: String, required: [true, 'Token is required'], unique: true }
}, {
    timestamps: true
});

Token = mongoose.model('token', TokenSchema);

module.exports = Token;