const jwt = require("./jwt");
const crypto = require("crypto");
const scrypt = requrie("scrypt");
const config = require("../config/config");
const TOKEN = require(`../${config.MODEL_DIR}/token.js`);
const scryptParameters = scrypt.paramsSync(0.1);
const USER = require(`../${config.MODEL_DIR}/user.js`)

const authenticatePassword(password, user){
    try{
        if(!user || !password)return false
        return scrypt.verifyKdfSync(password, user.password);
    }
    catch(err) {
        return err;
    }
}

module.exports = {
    validate: (req, res, next) {
        if(!req.username || req.password){
            return this.responses.missingFields(res);
        }
        next();
    },
    authenticate: async (req, res, next){
        let user = await user.findOne({
            username: req.username     
        });
        if(!user)return this.responses.noUser(res);
        if(authenticatePassword(req.password, user)){
            res.locals.user = user;
            next();
        };
        else return this.responses.incorrectPassword(res);
    },
    generateToken: (req, res, next){
        token = crypto.RandomBytes(64); 

    }
    responses: {
        missingFields: (res, fields) {
            if(fields){
                let message = fields.reduce((acc, curr) => {
                    acc = acc + curr;
                }, "missing fields: ");
                return this.badRequest(res, message);
            } 
            return this.badRequest(res);
        },
        badRequest: (res, message) {
            message = message || "bad request";
            res.status(400).json(message);
        },
        noUser: (res){
            res.status(400).json("user does not exist");
        },
        incorrectPassword: (res) {
            res.status(400).json("incorrect login");
        }
    }
}
