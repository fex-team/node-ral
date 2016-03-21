/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/9/4
 */

/* eslint-disable no-wrap-func, max-nested-callbacks, fecs-camelcase, camelcase */

'use strict';

var middleware = require('../lib/middleware.js');
var config = require('../lib/config.js');
var path = require('path');

describe('middleware', function () {

    it('show raw request time', function (done) {
        var m = middleware({
            confDir: path.join(__dirname, './middleware/config'),
            logger: {
                log_path: path.join(__dirname, '../logs'),
                app: 'yog-ral'
            },
            currentIDC: 'tc'
        });
        var req = {};
        m(req, {}, function () {
            req.RAL.should.be.ok;
            req.RALPromise.should.be.ok;
            config.getConf('FROM_MIDDLEWARE').should.be.ok;
            done();
        });
    });
});
