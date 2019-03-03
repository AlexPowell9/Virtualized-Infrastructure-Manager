const mongoose = require('mongoose');
const event = require("./events");
let schema = new mongoose.Schema(
    {
        type: String,
        user: String,
        events: [{
            type: event
        }]
    }
)
module.exports = mongoose.model('vm', schema);
