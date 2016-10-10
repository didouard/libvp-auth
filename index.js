var Logger            = require('node-wrapper/logger')

var Auth                = require("./Auth.js");
var config              = require("./config.json");

Logger.setOutputMethod(config.logger);
var logger = Logger.create("index");

var auth = new Auth(config);

auth.login((error, data) => {
    if (error) { logger.error(error); process.exit(1) }
    //logger.log(data);
    
    auth.checkLogged((err, isLogged) => {
        console.log(isLogged);
    })
});