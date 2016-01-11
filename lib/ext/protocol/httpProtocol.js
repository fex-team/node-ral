/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/5
 */

'use strict';

var Protocol = require('./httpProtocolBase.js');
// var logger = require('../../logger.js')('HttpProtocol');
var util = require('util');

function HttpProtocol() {
    Protocol.call(this);
}

util.inherits(HttpProtocol, Protocol);

HttpProtocol.normalizeConfig = Protocol.prototype.normalizeConfig;

HttpProtocol.prototype.getName = function () {
    return 'http';
};

module.exports = HttpProtocol;
