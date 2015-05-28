/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/16
 */

'use strict';

var RAL = require('../index.js').RAL;
var path = require('path');

RAL.init({
    confDir: path.join(__dirname, './config'),
    logger: {
        disable: true
    },
    currentIDC: 'tc'
});

var cp = require('child_process');

var pr = cp.fork(path.join(__dirname, './server/server.js'));

module.exports = RAL;
module.exports.end = function () {
    pr.kill();
};
