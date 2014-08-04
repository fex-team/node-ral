/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/4
 */

'use strict';

var logger = require('yog-log');

module.exports = function (prefix) {
    prefix = '['+prefix + "] ";
    return {
        "notice": function (msg) {
            logger.getLogger().notice('[yog-ral] ' + prefix + msg);
        },
        "warning": function (msg) {
            logger.getLogger().warning('[yog-ral] ' + prefix + msg);
        },

        "fatal": function (msg) {
            logger.getLogger().fatal('[yog-ral] ' + prefix + msg);
        },

        "trace": function (msg) {
            logger.getLogger().trace('[yog-ral] ' + prefix + msg);
        },

        "debug": function (msg) {
            logger.getLogger().debug('[yog-ral] ' + prefix + msg);
        }
    };
};

