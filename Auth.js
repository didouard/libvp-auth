var request           = require('request');
var Logger            = require('node-wrapper/logger')
var url               = require('url')

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

    this.login = (callback) => {
        var options = {};
        
        options = {
            url: "https://secure.fr.vente-privee.com/authentication/login/FR?ReturnUrl=/vp4/Home/Default.aspx"
            , method: 'POST'
            , json: data
            , jar: jar.get(config)
            , followAllRedirects: false
            , headers: {
                "Upgrade-Insecure-Requests": 1
            }
        }; 

        var requestAfter = (error, response, body) => {
            // manage redirection
            if (300 <= response.statusCode && response.statusCode < 400) {
                var locationUrl = url.parse(response.headers.location);
                var originUrl = url.parse(options.url);

                if (locationUrl.host == undefined || locationUrl.host.length < 1) {
                    originUrl.pathname = locationUrl.pathname;
                } else {
                    originUrl = locationUrl;
                }
                
                options.url = url.format(originUrl);
                
                logger.log("(%s) %s", response.statusCode, options.url);
                return request(options, requestAfter);
            } else {
                console.log(response.headers);
                return callback(error);
            }
        };
        
        request(options, requestAfter);
    };
};

module.exports = Auth;