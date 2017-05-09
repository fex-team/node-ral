/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/5
 */

'use strict';

var Protocol = require('../../protocol.js');
var logger = require('../../logger.js')('HttpProtocolBase');
var getProxyFromURI = require('../../../lib/getProxyFromURI.js');
var util = require('util');
var Stream = require('stream').Stream;
var urlencode = require('urlencode');
var zlib = require('zlib');
var url = require('url');
var ctx = require('../../ctx.js');
var urlParse = require('url').parse;
var HttpsProxyAgent = require('https-proxy-agent');


function HttpProtocolBase() {
    Protocol.call(this);
}

util.inherits(HttpProtocolBase, Protocol);

HttpProtocolBase.prototype.getName = function () {
    throw new Error('not implement');
};

HttpProtocolBase.prototype.normalizeConfig = HttpProtocolBase.normalizeConfig = function (config) {
    config = Protocol.normalizeConfig(config);
    if (config.disableGzip === undefined) {
        config.disableGzip = true;
    }
    if (typeof config.query !== 'object') {
        config.query = urlencode.parse(config.query, {
            charset: config.encoding
        });
    }
    if (config.path) {
        // auto replace spaces in path
        config.path = config.path.replace(/ /g, '%20');
        if (config.path[0] !== '/') {
            config.path = '/' + config.path;
        }
    }
    // support idc proxy
    if (config.proxy && config.proxy instanceof Array) {
        var defaultProxy = null;
        var idcProxyFounded = false;
        for (var i = 0; i < config.proxy.length; i++) {
            var proxy = config.proxy[i];
            if (proxy.idc === 'default') {
                defaultProxy = proxy.uri;
            }
            if (proxy.idc === ctx.currentIDC) {
                idcProxyFounded = true;
                config.proxy = proxy.uri;
                break;
            }
        }
        if (defaultProxy && !idcProxyFounded) {
            config.proxy = defaultProxy;
        }
        if (!defaultProxy && !idcProxyFounded && config.proxy[0]) {
            config.proxy = config.proxy[0].uri;
        }
    }
    return config;
};

HttpProtocolBase.prototype._prepareRequest = function (config) {
    if (!config.reqPathPrepared) {
        var query = urlencode.stringify(config.query, {
            charset: config.encoding
        });

        if (query) {
            // didn't handle # situation since backend should not get a hash tag
            if (config.path.indexOf('?') === -1) {
                config.realPath = config.path + '?' + query;
            } else {
                config.realPath = config.path + '&' + query;
            }
        } else {
            config.realPath = config.path;
        }

        if (config.url) {
            var urlparsed = urlParse(config.url);
            if (urlparsed.protocol) {
                config.https = urlparsed.protocol === 'https:';
                config.server = {
                    host: urlparsed.hostname,
                    port: parseInt(urlparsed.port, 10)
                };
                config.server.port = config.server.port || (config.https ? 443 : 80);
                config.realPath = urlparsed.path;
            }
        }

        // handle gzip
        if (config.disableGzip) {
            if (config.headers && config.headers['accept-encoding']) {
                config.headers['accept-encoding'] = '';
            }
        }

        // detect if there is empty value in headers
        if (config.headers) {
            var keys = Object.keys(config.headers);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (config.headers[key] === undefined || config.headers[key] === null) {
                    config.headers[key] = '';
                }
            }
        }

    }

    var opt = {
        host: config.server.host,
        port: config.server.port,
        path: config.realPath,
        method: config.method,
        headers: config.headers,
        // disable http pool to avoid connect problem https://github.com/mikeal/request/issues/465
        agent: false
    };

    if (config.https) {
        opt.key = config.key;
        opt.cert = config.cert;
        opt.protocol = 'https:';
        opt.rejectUnauthorized = config.rejectUnauthorized;
    } else {
        opt.protocol = 'http:';
    }

    var proxy = config.proxy || getProxyFromURI(opt);
    if (proxy) {
        var uri = opt.protocol + '//' + opt.host + ':' + opt.port;
        opt.headers = opt.headers || {};
        if (!opt.headers.Host && !opt.headers.host && !opt.headers.HOST) {
            opt.headers.Host = opt.host + ':' + opt.port;
        }
        if (opt.protocol === 'https:') {
            var agent = new HttpsProxyAgent(proxy);
            opt.agent = agent;
        } else {
            opt.path = url.resolve(uri, config.realPath);
            var proxyUri = url.parse(proxy);
            opt.host = proxyUri.hostname;
            opt.port = proxyUri.port ? proxyUri.port : (proxyUri.protocol === 'http:' ? 80 : 433);
        }
    }
    config.reqPathPrepared = true;
    return opt;
};

HttpProtocolBase.prototype._request = function (config, callback) {
    var response = new ResponseStream();
    var piped = false;
    var opt;

    opt = this._prepareRequest(config);

    var request;

    if (config.https) {
        request = require('https');
    } else {
        request = require('http');
    }

    // logger.trace('request start ' + JSON.stringify(opt));
    var req = request.request(opt, function (res) {
        if (res.statusCode >= 300 && !config.ignoreStatusCode) {
            var statusCodeError = new Error('Server Status Error: ' + res.statusCode);
            statusCodeError.statusCode = res.statusCode;
            callback && callback(response);
            response.emit('extras', {
                headers: res.headers,
                statusCode: res.statusCode
            });
            req.emit('error', statusCodeError);
            return;
        }
        var stream;
        // 添加 gzip与deflate 处理
        var contentEncoding = res.headers['content-encoding'];
        if (contentEncoding === 'gzip') {
            stream = zlib.createGunzip();
        } else if (contentEncoding === 'deflate') {
            stream = zlib.createInflate();
        }
        if (stream) {
            stream.on('error', function (error) {
                response.emit('error', error);
            });
            res.pipe(stream);
        } else {
            stream = res;
        }
        stream.pipe(response);
        callback && callback(response);
        response.emit('extras', {
            headers: res.headers,
            statusCode: res.statusCode
        });
    });

    if (config.payload) {
        req.write(config.payload);
        req.end();
    } else {
        // auto end if no pipe
        setImmediate(function () {
            piped || req.end();
        });
    }
    req.on('pipe', function () {
        piped = true;
    });
    return req;
};

function ResponseStream() {
    this.writable = true;
    this.data = null;
    this.chunks = [];
}

util.inherits(ResponseStream, Stream);

ResponseStream.prototype.write = function (chunk) {
    // store the data
    this.chunks.push(chunk);
};

ResponseStream.prototype.end = function () {
    var data = null;
    try {
        data = Buffer.concat(this.chunks);
        this.chunks = [];
        logger.trace('response end');
    } catch (ex) {
        logger.trace('response failed errmsg=' + ex.message);
        this.emit('error', ex);
        return;
    }
    // emit data at once
    this.emit('data', data);
    this.emit('end', data);
};

module.exports = HttpProtocolBase;
