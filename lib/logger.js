/**
 * @file node-ral logger
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/4
 */

/*eslint-disable fecs-camelcase, camelcase */

'use strict';

var logger = require('yog-log');
var path = require('path');
var cluster = require('cluster');
var clusterID = (cluster.isWorker ? cluster.worker.id : 'main');

var options = {
    format_wf: '%L: %t [%f:%N] errno[%E] logId[%l] uri[%U] user[%u] refer[%{referer}i] cookie[%{cookie}i] %S %M',
    log_path: path.join(__dirname, '../logs'),
    app: 'yog-ral'
};

module.exports = function (prefix) {
    prefix = '[cluster ' + clusterID + '][' + prefix + '] ';
    return {
        notice: function (msg) {
            if (options.disable) {
                return;
            }
            var content = Array.prototype.slice.call(arguments, 0).join('');
            logger.getLogger(options).notice('[yog-ral] ' + prefix + content);
        },
        warning: function (msg) {
            if (options.disable) {
                return;
            }
            var content = Array.prototype.slice.call(arguments, 0).join('');
            logger.getLogger(options).warning('[yog-ral] ' + prefix + content);
        },

        fatal: function (msg) {
            if (options.disable) {
                return;
            }
            var content = Array.prototype.slice.call(arguments, 0).join('');
            logger.getLogger(options).fatal('[yog-ral] ' + prefix + content);
        },

        trace: function () {
            if (options.disable) {
                return;
            }
            var content = Array.prototype.slice.call(arguments, 0).join('');
            logger.getLogger(options).trace('[yog-ral] ' + prefix + content);
        },

        debug: function (msg) {
            if (options.disable) {
                return;
            }
            var content = Array.prototype.slice.call(arguments, 0).join('');
            logger.getLogger(options).debug('[yog-ral] ' + prefix + content);
        }
    };
};

module.exports.__defineSetter__('options', function (opts) {
    options = opts;
});
