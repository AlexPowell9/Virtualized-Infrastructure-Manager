const mongoose = require('mongoose');
//stores all of the tokens for user login
let schema = new mongoose.Schema(
    {
        token: String,
        expiry: Date,
        user: {type: String}
    }
);

module.exports = mongoose.model('token', schema);
