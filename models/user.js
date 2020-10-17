const mongoose = require('mongoose');
const constants = require('../constants');


Schema = mongoose.Schema;


UserSchema = new Schema({
    [constants.uid]: { type: String, required: [true, 'Firebase userId is required'] , unique: true},
    [constants.name]: { type: String, required: [true, 'Name is required'] },
    [constants.phoneNumber]: { type: String, required: [true, 'Phone numeber is required'] },
    [constants.groups]: { type: [String], default: [] },
    [constants.profileUrl]: { type: String, default: "https://firebasestorage.googleapis.com/v0/b/ttmm-d9b4f.appspot.com/o/placeholders%2Fprofile_placeholder.jpg?alt=media&token=1cd39587-5053-47ee-a575-5aede7eddc9b" },
    [constants.upiId] : String,

});



User = mongoose.model('user', UserSchema);

module.exports = User;