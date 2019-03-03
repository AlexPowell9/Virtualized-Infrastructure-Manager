const mongoose = require('mongoose');

let schema = new mongoose.Schema(
    {
        type: String,
        time: {
            type: Date,
            set: Date.now
        }
    }
);

module.exports = schema;
