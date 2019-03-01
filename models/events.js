const mongoose = require('mongoose');

let schema = mongoose.Schema(
    {
        type: String,
        time: {
            type: Date,
            set: Date.now
        }
    }
);

module.exports = schema;