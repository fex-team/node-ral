/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/16
 */

'use strict';

var RAL = require('../index.js').RAL;
var path = require('path');

RAL.init({
    confDir : __dirname + path.sep + './config',
    logger : {
        disable: true
    },
    currentIDC : 'tc'
});

var cp = require('child_process');

var pr = cp.fork(__dirname + path.sep +  './server/server.js');

module.exports = RAL;
module.exports.end = function(){
    pr.kill();
};
