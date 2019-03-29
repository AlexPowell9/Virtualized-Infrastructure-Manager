const crypto = require("crypto");
const scrypt = require("scrypt");
const config = require("../config/config");
const TOKEN = require(`../${config.MODEL_DIR}/token.js`);
const scryptParameters = config.SCRYPT_PARAMS;
const USER = require(`../${config.MODEL_DIR}/user.js`);

//authenticate the user - check if the hash matches
const authenticatePassword = (password, user) => {
    try {
        if (!user || !password) return false
        return scrypt.verifyKdfSync(new Buffer(user.password, "base64"), password);
    } catch (err) {
        console.log(err);
        return err;
    }
}

//some responses
const badRequest = (res, message) => {
    message = message || "bad request";
    res.status(400).json(message);
} 
//lets the user know what fields are missing in a form
const missingFields = (res, fields) => {
    if (fields) {
        let message = fields.reduce((acc, curr) => {
            acc = acc + curr;
        }, "missing fields: ");
        return badRequest(res, message);
    }
    return badRequest(res);
}

//if the user doesn't exist
const noUser = (res) => {
    res.status(400).json("user does not exist");
}

//if the password is incorrect
const incorrectPassword = (res) => {
    res.status(400).json("incorrect Password");
}

//send the token back
const sendToken = (res, token) => {
    res.status(200).json(token);
}

//user creation successful
const createdUser = (res, user) => {
    res.status(201).json(user);
}


module.exports = {
    validate: (req, res, next) => {
        //validate login form
        if (!req.body.username || !req.body.password) {
            return missingFields(res);
        }
        next();
    },
    authenticate: async (req, res, next) => {
        let user = await USER.findOne({//find the user with a user name
            username: req.body.username
        }).exec();
        if (!user) return noUser(res);//user doesn't exist
        //authenicate user and let other handlers know the user id
        if (authenticatePassword(req.body.password, user)) {
            res.locals.user = user;
            res.locals.user.id = user._id;
            next();
        } else return incorrectPassword(res);
    },
    generateToken: async (req, res, next) => {
        let token = {//generate a random token for authentication
            token: crypto.randomBytes(64).toString("base64"),
            expiry: Date.now() + config.TOKEN_EXPIRY,//add a token expiry - future use
            user: res.locals.user.id//set the user id for the token
        }
        token = await TOKEN.create(token);//create token
        return sendToken(res, token);//send token to user
    },
    registerUser: async (req, res, next) => {
        let user = res.locals.body || req.body;
        let newUser = await USER.create(user);
        createdUser(res, newUser);
        if (next) next();
    },
    authenticateUser: async (req, res, next) => {
        try {
            let token = req.header("Authorization").slice(7);//get the token from the auth header
            let t = await TOKEN.findOne({//find the token
                token: token
            }).exec();
            if (t) {
                //find the user and set the user
                let user = await USER.findById(t.user).exec();
                res.locals.user = {};
                res.locals.user.id = user._id;
            }
            next()
        } catch (e) {
            next();
        }

    }
};