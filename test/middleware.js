/*
 * fis
 * http://fis.baidu.com/
 * 2014/9/4
 */

'use strict';

var middleware = require('../lib/middleware.js');
var config = require('../lib/config.js');
var path = require('path');

describe('middleware', function () {

    it('show raw request time', function (done) {
        var m = middleware({
            confDir : __dirname + path.sep + './middleware/config',
            logger : {
                "log_path" : __dirname + path.sep + '../logs',
                "app" : "yog-ral"
            },
            currentIDC : 'tc'
        });
        var req = {};
        m(req, {}, function(){
            req.RAL.should.be.ok;
            config.getConf('FROM_MIDDLEWARE').should.be.ok;
            done();
        });
    });
});