const mongoose = require('mongoose');
const constants = require('../constants');

Schema = mongoose.Schema;


CashSchema = new Schema({
    [constants.paymentId]: { type: String, require: true, unique: true },
    [constants.eventId]: { type: String, require: true },
    [constants.to]: { type: String, require: [true] },
    [constants.phoneNumber]: { type: String, required: true },
    [constants.amount]: { type: Number, require: true },
    [constants.got]: { type: String, require: true },
}, {
    timestamps: true
}
);


Cash = mongoose.model('cashPayment', CashSchema);

module.exports = Cash;