module.exports = {
    validate: (req, res, next) => {
        if(!req.username || req.password){
            return this.responses.missingFields(res);
        }
        next();
    },
    authenticate: (req, res, next) => {
            
    },
    generateToken: (req, res, next) =>{
             
    },
    responses: {
        missingFields: (res, fields) => {
            if(fields){
                let message = fields.reduce((acc, curr) => {
                    acc = acc + curr;
                }, "missing fields: ");
                return this.badRequest(res, message);
            } 
            return this.badRequest(res);
        },
        badRequest: (res, message) => {
            message = message || "bad request";
            res.status(400).json(message);
        }
    }
}
