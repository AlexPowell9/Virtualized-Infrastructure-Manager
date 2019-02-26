const mongoose = require('mongoose');

let schema = mongoose.Schema(
    {
        type: String,
    }
)
module.exports = mongoose.Model('vm', schema);