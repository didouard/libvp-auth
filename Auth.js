var request           = require('request');
var Logger            = require('node-wrapper/logger');
var url               = require('url');
var async             = require('async')


var jar               = require("./common/jar.js");

var Auth = function (config) {
    var self = this;
    var initiate = false;
    
    Logger.setOutputMethod({ default: {type: 'console'} });
    var logger = Logger.create("Auth");
    
    var data = { "Mail": config.auth.email
        , "FacebookId": null
        , "ExplicitFacebookConnect": false    
        , "FacebookToken": null
        , "FacebookConnectTries": 0
        , "Password": config.auth.password
    };
    
    this.init = (origin, callback) => {
        logger.log('Initiate cookie Jar', initiate);
        
        var callVP = (callback) => {
            var options = {
                url: "http://www.vente-privee.com"
                , jar: jar.get(config)
                , followAllRedirects: true
            };
            console.log("lala", options);
            request(options, callback);
        };
        
        var setInitiate = (response, body, callback) => {

            initiate = true;
            return callback();
        };
        
        var jobs = [callVP, setInitiate];
        async.waterfall(jobs, callback);
    };

    this.login = (callback) => {
        logger.debug("Authentificate");
        
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
            /*/logger.log("(%s) %s", response.statusCode, options.url);/**/
            if (300 <= response.statusCode && response.statusCode < 400) {
                var locationUrl = url.parse(response.headers.location);
                var originUrl = url.parse(options.url);

                if (locationUrl.host == undefined || locationUrl.host.length < 1) {
                    originUrl.pathname = locationUrl.pathname;
                } else {
                    originUrl = locationUrl;
                }
                
                options.url = url.format(originUrl);

                if (/.*(Error_500).*/.test(options.url)) {
                    logger.warning("Error detected, retry ...");
                    return self.login(callback);   
                }

                if (/.*(authentication).*/.test(options.url)) logger.debug("Authentification");
                else if (/.*(SiteSecure).*/.test(options.url)) logger.debug("Do cypher");
                else if (/.*(homev6).*/.test(options.url)) logger.debug("Call final home");
                else if (/.*(Home).*/.test(options.url)) logger.debug("Call Home");
                
                /*/logger.log("Redicted to", options.url);/**/
                return request(options, requestAfter);    
            } else {
                
                // Crapy code, you can do better
                var matches = body.match(/.*errorTitle.*>(.*)<\/h1>/)
                if (matches != null) logger.error(matches[1]);
                
                return callback(error);
            }
        };
        
        request(options, requestAfter);
    };
    
    this.checkLogged = function (callback) {
        var cookies = jar.get(config).getCookies('https://secure.fr.vente-privee.com');
        
        for (var i = 0; i < cookies.length; i++) {
            var matches = cookies[i].toString().match(/^infoMember=mid=([0-9]*);.*/);
            console.log(cookies[i].toString(), " - ", matches);
            if (matches != null) { 
                logger.log("Logger, member id: %d", matches[1]);
                return callback(null, true);
            }
        }
        return callback(null, false);
    }
};

module.exports = Auth;