const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const logSchema = new Schema({
    request: {
        type: Object,
        required: true
    },
    adminApproval: {
        type: Schema.Types.ObjectId,
        required: true
    }

});

module.exports = mongoose.model('Logproduct', logSchema);