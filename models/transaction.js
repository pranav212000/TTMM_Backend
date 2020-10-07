const mongoose = require('mongoose');
const constants = require('../constants');

Schema = mongoose.Schema;


TransactionSchema = new Schema({

    [constants.transactionId]: { type: String, required: [true, 'TransactionId not specified'] },
    [constants.split]: { type: String, default: constants.byOrder },
    [constants.toGet]: {
        type: [{
            [constants.phoneNumber]: String,
            // [constants.from]: String,
            [constants.amount]: Number

        }],
        default: [],
        unique: true
    },
    [constants.toGive]: {
        type: [{
            [constants.phoneNumber]: String,
            // [constants.to]: String,
            [constants.amount]: Number

        }],
        default: []
    },
    [constants.got]: {
        type: [{
            [constants.phoneNumber]: String,
            [constants.from]: String,
            [constants.amount]: Number

        }],
        default: []
    },
    [constants.given]: {
        type: [{
            [constants.phoneNumber]: String,
            [constants.to]: String,
            [constants.amount]: Number

        }],
        default: []
    },
    [constants.paid]: {
        type: [{
            [constants.phoneNumber]: String,
            [constants.paymentMode] : String,
            [constants.amount]: Number
        }],
        default: []
    },
    [constants.totalCost]: { type: Number, default: 0 },
    [constants.totalPaid]: { type: Number, default: 0 },

}, {
    timestamps: true
}
);







Transaction = mongoose.model('transaction', TransactionSchema);

module.exports = Transaction;