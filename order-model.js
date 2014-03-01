var mongoose = require('mongoose');

var OrderSchema = new mongoose.Schema({
    txid: {
        type: String,
        unique: true,
        required: true
    },
    prod: {
        type: String,
        unique: false,
        required: true
    },
    toaddr: {
        type: String,
        unique: true,
        required: true
    },
    secret: {
        type: String,
        unique: true,
        required: true
    },
    txhash: {
        type: String,
        unique: false,
        required: false
    },
    inputtx: {
        type: String,
        unique: false,
        required: false
    },
    price: {
        type: Number,
        unique: false,
        required: true
    },
    stat: {
        type: Number,
        unique: false,
        required: true
    }
});

module.exports = mongoose.model('Order', OrderSchema);
