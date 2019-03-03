const mongoose = require('mongoose');
const config = require('../config/config');
const scrypt = require("scrypt");
const scryptParams = config.SCRYPT_PARAMS;

let schema = new mongoose.Schema({
        username: String,
        password: String
});

schema.pre('save', function(next){
    if (!this.isModified('password')) {
        return next();
    }
    try {
        this.password = scrypt.kdfSync(this.password, scryptParams);
        next();
    } catch (err) {
        next(err);

    }

})
module.exports = mongoose.model('login', schema);
