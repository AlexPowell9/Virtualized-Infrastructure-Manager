const mongoose = require('mongoose');

let schema = mongoose.Schema(
    {
        token: String,
        expiry: Date,
        user: {type: String}
    }
);

module.exports = mongoose.model('token', schema);