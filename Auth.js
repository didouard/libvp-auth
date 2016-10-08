var request           = require('request');
var Logger            = require('node-wrapper/logger')

var jar               = require("./common/jar.js");

var Auth = function (config) {
    
    Logger.setOutputMethod({ default: {type: 'console'} });
    var logger = Logger.create("Auth");
    
    var data = { "Mail": config.auth.email
        , "FacebookId": null
        , "ExplicitFacebookConnect": false    
        , "FacebookToken": null
        , "FacebookConnectTries": 0
        , "Password": config.auth.password
    };
    var url = "https://secure.fr.vente-privee.com/authentication/login/FR?ReturnUrl=/vp4/Home/Default.aspx";


    this.login = (callback) => {
        var options = {};
        
        options = {
            uri: url
            , method: 'POST'
            , json: data
            , jar: jar.get(config)
            , followAllRedirects: false
            , headers: {
                "Upgrade-Insecure-Requests": 1
            }
        }; 
        
        request(options, function (error, response, body) {
            logger.log("StatusCode: %s", response.statusCode);
            console.log(response.headers);
            return callback(error);
        });
    };
};

module.exports = Auth;