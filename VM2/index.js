const config = require("./config/config");
const express = require("express");
var bodyParser = require('body-parser');
const mongoose = require("mongoose");
const request = require("request");


const setupEnv = require(`./${config.SETUP_ENV_LOCATION}`);

//connect to mongodb
mongoose.connect(config.dbUri).catch((e) =>{
    console.log(e);//if error
});

let start = async ()=>{
    await setupEnv();//setup the server, useful for future expansion
    const app = express();//using express for routing
    app.use(bodyParser.json({//for parsing body of requests as JSON
        limit: '10mb'
    }));
    app.use(bodyParser.urlencoded({//for parsing URL queries
        limit: '10mb',
        extended: true
    }));
    app.use((req, res, next) => {
        console.log("API request:", req.method ,req.originalUrl);
        next();
    });
    app.use(require(`./${config.ROUTES_DIR}/index`));//api routes to /api
    app.use((req, res, next) => {
        console.log("Static request:", req.originalUrl);
        next();
    })
    //app.use(express.static('public'));//static resources found in public
    app.listen(config.SERVER_PORT, config.functions.onServerStart);//run server
}
start();
