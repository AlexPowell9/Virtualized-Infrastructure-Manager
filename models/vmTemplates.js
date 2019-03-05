const mongoose = require('mongoose');

let schema = new mongoose.Schema(
    {
        name:String,
        description: String,
        rate: Number
    }
);

module.exports = mongoose.model("template", schema);
