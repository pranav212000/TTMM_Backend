const mongoose = require('mongoose');
const constants = require('../constants');

Schema = mongoose.Schema;


GroupSchema = new Schema({
    [constants.groupId]: { type: String, required: [true, 'Firebase userId is required'] },
    [constants.groupName]: { type: String, required: [true, 'Name is required'] },
    [constants.groupMembers]: { type: [String], default: [] },
    [constants.groupIconUrl]: { type: String, default: "https://firebasestorage.googleapis.com/v0/b/ttmm-d9b4f.appspot.com/o/placeholders%2Fgroup_placeholder.png?alt=media&token=e0d875be-8f8f-4ae5-840b-855c549e30ec" },
    [constants.groupEvents]: { type: [String], default: [] },
}, {
    timestamps: true
}
);







Group = mongoose.model('group', GroupSchema);

module.exports = Group;