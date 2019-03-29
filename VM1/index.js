const config = require("./config/config");
const express = require("express");
var bodyParser = require('body-parser');
const mongoose = require("mongoose");
const request = require("request");
var proxy = require('express-http-proxy');

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
    //app.use("/api", require(`./${config.ROUTES_DIR}/index`));//api routes to /api
    app.use("/api", proxy(config.API_SERVER_IP));
    app.use("/api", (req, res, next) => {
        console.log("API request:", req.originalUrl, "proxied to", config.API_SERVER_IP);
        let url = config.API_SERVER_IP + req.originalUrl;
        request(url, (resp) => {
            console.log(resp);
        })
        request(url).pipe(res);
    });
    app.use((req, res, next) => {
        console.log("Static request:", req.originalUrl);
        next();
    })
    app.use(express.static('public'));//static resources found in public
    app.listen(config.SERVER_PORT, config.functions.onServerStart);//run server
}
start();
