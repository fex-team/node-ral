/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/4
 */

'use strict';

var logger = require('yog-log');
var path = require('path');

var options = {
    'format_wf' : '%L: %t [%f:%N] errno[%E] logId[%l] uri[%U] user[%u] refer[%{referer}i] cookie[%{cookie}i] %S %M',
    'log_path' : __dirname + path.sep + '../logs',
    'app' : 'yog-ral'
};

module.exports = function (prefix) {
    prefix = '['+prefix + "] ";
    return {
        "notice": function (msg) {
            logger.getLogger(options).notice('[yog-ral] ' + prefix + Array.prototype.slice.call(arguments, 0).join(''));
        },
        "warning": function (msg) {
            logger.getLogger(options).warning('[yog-ral] ' + prefix + Array.prototype.slice.call(arguments, 0).join(''));
        },

        "fatal": function (msg) {
            logger.getLogger(options).fatal('[yog-ral] ' + prefix + Array.prototype.slice.call(arguments, 0).join(''));
        },

        "trace": function () {
            logger.getLogger(options).trace('[yog-ral] ' + prefix + Array.prototype.slice.call(arguments, 0).join(''));
        },

        "debug": function (msg) {
            logger.getLogger(options).debug('[yog-ral] ' + prefix + Array.prototype.slice.call(arguments, 0).join(''));
        }
    };
};

