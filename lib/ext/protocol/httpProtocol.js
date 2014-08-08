/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/5
 */

'use strict';

var Protocol = require('../../protocol.js');
var logger = require('../../logger.js')('HttpProtocol');
var util = require('util');
var url = require('url');
var qs = require('qs');
var request = require('request');

function HttpProtocol(){
    Protocol.call(this);
}

util.inherits(HttpProtocol, Protocol);

HttpProtocol.prototype.getName = function(){
    return 'http';
};

HttpProtocol.prototype._getUri = function(options){
    return url.resolve(['http://', options.server.host, ':', options.server.port].join(''), options.path);
};

HttpProtocol.prototype.normalizeContext = HttpProtocol.normalizeContext = function(context){
    context = Protocol.normalizeContext(context);
    if (typeof context.query !== 'object'){
        context.query = qs.parse(context.query);
    }
    return context;
};

HttpProtocol.prototype.talk = function(context){
    var opt = {
        uri: this._getUri(context),
        qs: context.query,
        method: context.method,
        headers: context.headers,
        gzip: true,
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

module.exports = HttpProtocol;