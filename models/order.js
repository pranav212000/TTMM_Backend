const mongoose = require('mongoose');
const constants = require('../constants');

Schema = mongoose.Schema;


OrderSchema = new Schema({

    [constants.orderId]: { type: String, required: [true, 'Order id not specified'] },
    [constants.eventId]: { type: String, required: [true, 'Event Id is required'] },
    [constants.phoneNumber]: { type: [String], required: [true, 'Phone Number not specified'] },
    [constants.itemName]: { type: String, required: [true, 'Item name not specified'] },
    [constants.quantity]: { type: Number, required: [true, 'Quantity not specified'] },
    [constants.cost]: { type: Number, required: [true, 'Cost is not specified'] },
    [constants.totalCost]: { type: Number }



    // [constants.groupId]: { type: String, required: [true, 'Firebase userId is required'] },
    // [constants.groupName]: { type: String, required: [true, 'Name is required'] },
    // [constants.groupMembers]: { type: [String], default: [] },
    // [constants.groupIconUrl]: { type: String, default: "https://firebasestorage.googleapis.com/v0/b/ttmm-d9b4f.appspot.com/o/placeholders%2Fgroup_placeholder.png?alt=media&token=e0d875be-8f8f-4ae5-840b-855c549e30ec" },
    // [constants.groupEvents]: { type: [String], default: [] }
});


Order = mongoose.model('order', OrderSchema);

module.exports = Order;