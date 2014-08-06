/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/5
 */

'use strict';

var protocol = require('../../protocol.js');
var Protocol = protocol.Protocol;
var ProtocolContext = protocol.ProtocolContext;
var logger = require('../../logger.js')('HttpProtocol');
var util = require('util');
var qs = require('qs');
var http = require('http');

function HttpProtocol(){
    Protocol.call(this);
    this.protocol = http;
}

util.inherits(HttpProtocol, Protocol);

HttpProtocol.prototype.getContext = function(){
    return HttpProtocolContext;
};

HttpProtocol.prototype.getName = function(){
    return 'http';
};

HttpProtocol.prototype.talk = function(context, request){
    this._prepareOptions(context, request);
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
    //parse query from plain string to object
    typeof service.query === 'object' ? this.query = service.query : this.query = qs.parse(service.query);
    logger.trace('create HttpProtocolContext succ ServiceID=' + serviceID);
}

util.inherits(HttpProtocolContext, ProtocolContext);

HttpProtocolContext.prototype.getOptions = function(){
    //make a option copy
    var options = ProtocolContext.prototype.getOptions.call(this);
    this._extendProperty(options, 'url');
    this._extendProperty(options, 'method');
    this._extendProperty(options, 'headers');
    this._extendProperty(options, 'query');
    return options;
};

module.exports = HttpProtocol;
module.exports.HttpProtocolContext = HttpProtocolContext;