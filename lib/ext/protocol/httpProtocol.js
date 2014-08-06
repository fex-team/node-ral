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
var url = require('url');
var qs = require('qs');
var request = require('request');

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

HttpProtocol.prototype._getUri = function(options){
    return url.resolve(['http://', options.server.host, ':', options.server.port].join(''), options.path);
};

HttpProtocol.prototype._request = function(options){
    var opt = {
        uri: this._getUri(options),
        qs: options.query,
        method: options.method,
        headers: options.headers,
        gzip: true,
        form: options.payload,
        //disable http pool to avoid connect problem https://github.com/mikeal/request/issues/465
        pool: false
    };
    logger.trace('request start ' + JSON.stringify(opt));
    var req = request(opt);
    req.on('response', function(res) {
        if (res.statusCode >= 400) {
            req.emit('error', new Error('Server Status Error: ' + res.statusCode));
        }
    });
    return req;
};

/**
 * use HttpProtocolContext to get more information from service.
 * e.g. url, method etc..
 * @param serviceID
 * @param service
 * @constructor
 */
function HttpProtocolContext(serviceID, service){
    this._optNames = ['path', 'method', 'headers', 'query'];
    ProtocolContext.apply(this, arguments);
    //parse query from plain string to object
    if (typeof service.query !== 'object'){
        this.query = qs.parse(this.query);
    }
    logger.trace('create HttpProtocolContext succ ServiceID=' + serviceID);
}

util.inherits(HttpProtocolContext, ProtocolContext);

//HttpProtocolContext.prototype.getOptions = function(){
//    //make a option copy
//    var options = ProtocolContext.prototype.getOptions.call(this);
//    this._extendProperty(options, 'path');
//    this._extendProperty(options, 'method');
//    this._extendProperty(options, 'headers');
//    this._extendProperty(options, 'query');
//    return options;
//};

module.exports = HttpProtocol;
module.exports.HttpProtocolContext = HttpProtocolContext;