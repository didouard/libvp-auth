var request                     = require("request");
var FileCookieStore             = require('tough-cookie-filestore');

var Jar = function () {
        
    // todo
    var openJarFile = (callback) => {
        fs.open(config.cookies['jar-file'], 'w', callback);
    };
    
    var closeJarFile = (fd, callback) => {
        fs.close(fd, callback);
    };
    //!todo
    
    var jar = [];
    this.get = (config) => {
        if (jar[config.cookies['jar-file']] == undefined) 
            jar[config.cookies['jar-file']] = request.jar(new FileCookieStore(config.cookies['jar-file']));
        return jar[config.cookies['jar-file']];
    };
};

module.exports = new Jar();