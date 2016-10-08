var request                     = require("request");
var FileCookieStore             = require('tough-cookie-filestore');

var Jar = function () {
    var jar = [];
    this.get = (config) => {
        if (jar[config.cookies['jar-file']] == undefined) 
            jar[config.cookies['jar-file']] = request.jar(new FileCookieStore(config.cookies['jar-file']));
        return jar[config.cookies['jar-file']];
    };
};

module.exports = new Jar();