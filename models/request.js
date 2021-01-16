const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const requestSchema = new Schema({
    product: {
        type: Object,
        required: true
    },
    userName: {
        type: String,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        required: true
    }

});

module.exports = mongoose.model('Request', requestSchema);