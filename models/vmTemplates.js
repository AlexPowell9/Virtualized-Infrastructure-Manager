const mongoose = require('mongoose');

let schema = new mongoose.Schema(
    {
        type: String,
        name: Date,
        descriptions: String,
        rate: Number
    }
);

module.exports = mongoose.model("template", schema);
