const mongoose = require('mongoose');
const constants = require('../constants');

Schema = mongoose.Schema;


OrderSchema = new Schema({

    [constants.orderId]: { type: String, required: [true, 'Order id not specified'] , unique: true},
    [constants.eventId]: { type: String, required: [true, 'Event Id is required'] },
    [constants.phoneNumber]: { type: [String], default: []},
    [constants.itemName]: { type: String, required: [true, 'Item name not specified'] },
    [constants.quantity]: { type: Number, required: [true, 'Quantity not specified'] },
    [constants.cost]: { type: Number, required: [true, 'Cost is not specified'] },
    [constants.totalCost]: { type: Number }

}, {
    timestamps: true
});


Order = mongoose.model('order', OrderSchema);

module.exports = Order;