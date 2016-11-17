/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/19
 */

'use strict';

var ConfigNormalizer = require('../../config/configNormalizer.js');
var _ = require('underscore');
var util = require('util');

var defaultServiceInfo = {
    retry: 0,
    timeout: 3000,
    encoding: 'utf8',
    hybird: false,
    pack: 'string',
    unpack: 'string',
    portOffset: 0,
    path: '/'
};

function DefaultConfig() {
    ConfigNormalizer.call(this);
}

util.inherits(DefaultConfig, ConfigNormalizer);

DefaultConfig.prototype.normalizeConfig = function (config) {
    // inherit default config
    _.forEach(defaultServiceInfo, function (value, key) {
        if (config.hasOwnProperty(key) === false) {
            config[key] = value;
        }
    });
    config.encoding = config.encoding.toString().toLowerCase();
    config.timeout = Math.ceil(config.timeout);
    // apply port offset to server port
    _.forEach(config.server, function (server) {
        // default server port
        if (server.port === undefined || server.port === null) {
            server.port = 80;
        }
        server.port = server.port + config.portOffset;
    });
    if (config.customLog) {
        var customLogPair = [];
        var customLogKeys = Object.keys(config.customLog);
        for (var i = 0; i < customLogKeys.length; i++) {
            var key = customLogKeys[i];
            if (config.customLog[key] && typeof config.customLog[key] === 'string') {
                var param = config.customLog[key].split('.');
                customLogPair.push({
                    key: key,
                    param: param
                });
            }
        }
        config.customLog = customLogPair;
    }
    return config;
};

DefaultConfig.prototype.getName = function () {
    return 'default';
};

module.exports = DefaultConfig;
