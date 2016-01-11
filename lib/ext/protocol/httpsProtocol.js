/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/5
 */

'use strict';

var Protocol = require('./httpProtocolBase.js');
// var logger = require('../../logger.js')('HttpsProtocol');
var util = require('util');

function HttpsProtocol() {
    Protocol.call(this);
}

util.inherits(HttpsProtocol, Protocol);

HttpsProtocol.prototype.getName = function () {
    return 'https';
};

HttpsProtocol.prototype.normalizeConfig = HttpsProtocol.normalizeConfig = function (config) {
    config = Protocol.normalizeConfig(config);
    config.https = true;
    return config;
};

HttpsProtocol.normalizeConfig = HttpsProtocol.prototype.normalizeConfig;

module.exports = HttpsProtocol;
