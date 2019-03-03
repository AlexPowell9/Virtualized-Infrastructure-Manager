const crypto = require("crypto");
const scrypt = require("scrypt");
const config = require("../config/config");
const TOKEN = require(`../${config.MODEL_DIR}/token.js`);
const scryptParameters = config.SCRYPT_PARAMS;
const USER = require(`../${config.MODEL_DIR}/user.js`);

const authenticatePassword = (password, user) => {
    try {
        if (!user || !password) return false
        return scrypt.verifyKdfSync(password, user.password);
    } catch (err) {
        return err;
    }
}

const badRequest = (res, message) => {
    message = message || "bad request";
    res.status(400).json(message);
} 

const missingFields = (res, fields) => {
    if (fields) {
        let message = fields.reduce((acc, curr) => {
            acc = acc + curr;
        }, "missing fields: ");
        return badRequest(res, message);
    }
    return badRequest(res);
}

const noUser = (res) => {
    res.status(400).json("user does not exist");
}

const incorrectPassword = (res) => {
    res.status(400).json("incorrect login");
}

const sendToken = (res, token) => {
    res.status(200).json(token);
}

const createdUser = (res, user) => {
    res.status(201).json(user);
}


module.exports = {
    validate: (req, res, next) => {
        if (!req.body.username || !req.body.password) {
            return missingFields(res);
        }
        next();
    },
    authenticate: async (req, res, next) => {
        let user = await USER.findOne({
            username: req.body.username
        }).exec();
        if (!user) return noUser(res);
        if (authenticatePassword(req.body.password, user)) {
            res.locals.user = user;
            next();
        } else return incorrectPassword(res);
    },
    generateToken: async (req, res, next) => {
        let token = {
            token: crypto.randomBytes(64),
            expiry: Date.now() + config.TOKEN_EXPIRY,
            user: res.locals.user._id
        }
        token = await TOKEN.create(token);
        return sendToken(res, token);
    },
    registerUser: async (req, res, next) => {
        let user = res.locals.body || req.body;
        let newUser = await USER.create(user);
        createdUser(res, newUser);
        if (next) next();
    },
    authenticateUser: async (req, res, next) => {
        try {
            let token = req.header("authorization").slice(7);
            let t = await TOKEN.findOne({
                token: token
            }).exec();
            if (t) {
                let user = USER.findById(t.id);
                res.locals.user = {};
                res.locals.user.id = user._id;
            }
            next()
        } catch (e) {
            next();
        }

    }
};