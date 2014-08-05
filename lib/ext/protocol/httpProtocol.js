/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/5
 */

'use strict';

var Protocol = require('../../protocol.js').Protocol;
var ProtocolContext = require('../../protocol.js').ProtocolContext;
var logger = require('../../logger.js')('HttpProtocol');
var util = require('util');
var qs = require('qs');

function HttpProtocol(){
    Protocol.call(this);
}

util.inherits(HttpProtocol, Protocol);

HttpProtocol.prototype.getContext = function(){
    return HttpProtocolContext;
};

HttpProtocol.prototype.getName = function(){
    return 'http';
};

/**
 * use HttpProtocolContext to get more information from service.
 * e.g. url, method etc..
 * @param serviceID
 * @param service
 * @constructor
 */
function HttpProtocolContext(serviceID, service){
    ProtocolContext.apply(this, arguments);
    this.url = service.url;
    this.method = service.method;
    this.headers = service.headers;
    typeof service.query === 'object' ? this.query = service.query : this.query = qs.parse(service.query);
    logger.trace('create HttpProtocolContext succ ServiceID=' + serviceID);
}

util.inherits(HttpProtocolContext, ProtocolContext);

module.exports = HttpProtocol;
module.exports.HttpProtocolContext = HttpProtocolContext;