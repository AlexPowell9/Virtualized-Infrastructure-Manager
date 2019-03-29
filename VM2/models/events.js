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
//this gets stored in the vm object, so this doesn't return a model
module.exports = schema;
