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
var urlencode = require('urlencode');
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

HttpProtocol.prototype.normalizeConfig = HttpProtocol.normalizeConfig = function(config){
    config = Protocol.normalizeConfig(config);
    if (typeof config.query !== 'object'){
        config.query = urlencode.parse(config.query, config.encoding);
    }
    return config;
};

HttpProtocol.prototype._request = function(config){
    var opt = {
        uri: this._getUri(config),
        qs: config.query,
        method: config.method,
        headers: config.headers,
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