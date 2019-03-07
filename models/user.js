const mongoose = require('mongoose');
const config = require('../config/config');
const scrypt = require("scrypt");
const scryptParams = config.SCRYPT_PARAMS;

let schema = new mongoose.Schema({
        username: String,
        password: String
});

//when the user is registered or the password is changed it hashes the password
schema.pre('save', function(next){
    if (!this.isModified('password')) {
        return next();
    }
    try {
        //uses scrypt for password hashing
        this.password = scrypt.kdfSync(this.password, scryptParams).toString("base64");
        next();
    } catch (err) {
        next(err);

    }

})
module.exports = mongoose.model('login', schema);
