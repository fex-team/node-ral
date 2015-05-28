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
    path: '/'
};

function DefaultConfig() {
    ConfigNormalizer.call(this);
}

util.inherits(DefaultConfig, ConfigNormalizer);

DefaultConfig.prototype.normalizeConfig = function (config) {
    // inherit default config
    _.map(defaultServiceInfo, function (value, key) {
        if (config.hasOwnProperty(key) === false) {
            config[key] = value;
        }
    });
    config.encoding = config.encoding.toString().toLowerCase();
    config.timeout = Math.ceil(config.timeout);
    return config;
};

DefaultConfig.prototype.getName = function () {
    return 'default';
};

module.exports = DefaultConfig;
