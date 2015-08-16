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
    if (config.path && config.path[0] !== '/') {
        config.path = '/' + config.path;
    }
    return config;
};

HttpProtocolBase.prototype._request = function (config, callback) {
    var response = new ResponseStream();
    var piped = false;
    var path;

    var query = urlencode.stringify(config.query, {
        charset: config.encoding
    });
    if (query) {
        // didn't handle # situation since backend should not get a hash tag
        if (config.path.indexOf('?') === -1) {
            path = config.path + '?' + query;
        }
        else {
            path = config.path + '&' + query;
        }
    }
    else {
        path = config.path;
    }

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
        };
    }


    var opt = {
        host: config.server.host,
        port: config.server.port,
        path: path,
        method: config.method,
        headers: config.headers,
        // disable http pool to avoid connect problem https://github.com/mikeal/request/issues/465
        agent: false
    };
    var request;

    if (config.https) {
        request = require('https');
        opt.key = config.key;
        opt.cert = config.cert;
        opt.protocol = 'https:';
        opt.rejectUnauthorized = config.rejectUnauthorized;
    }
    else {
        opt.protocol = 'http:';
        request = require('http');
    }


    var proxy = config.proxy || getProxyFromURI(opt);

    if (proxy) {
        var uri = opt.protocol + "//" + opt.host + ":" + opt.port;
        opt.headers = opt.headers || {};
        opt.headers['HOST'] = opt.host + ":" + opt.port;
        opt.path = url.resolve(uri, path);
        var proxyUri = url.parse(proxy);
        opt.host = proxyUri.hostname;
        opt.port = proxyUri.port ? proxyUri.port : (proxyUri.protocol === 'http:' ? 80 : 433);
    }

    logger.trace('request start ' + JSON.stringify(opt));
    var req = request.request(opt, function (res) {
        if (res.statusCode >= 300 && !config.ignoreStatusCode) {
            var statusCodeError = new Error('Server Status Error: ' + res.statusCode);
            statusCodeError.statusCode = res.statusCode;
            req.emit('error', statusCodeError);
        }
        // 添加 gzip与deflate 处理
        switch (config.headers ? res.headers['content-encoding'] : '') {
            // or, just use zlib.createUnzip() to handle both cases
        case 'gzip':
            res.pipe(zlib.createGunzip()).pipe(response);
            break;
        case 'deflate':
            res.pipe(zlib.createInflate()).pipe(response);
            break;
        default:
            res.pipe(response);
            break;
        }
        callback && callback(response);
    });

    if (config.payload) {
        req.write(config.payload);
        req.end();
    }
    else {
        // auto end if no pipe
        process.nextTick(function () {
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
    }
    catch (ex) {
        logger.trace('response failed errmsg=' + ex.message);
        this.emit('error', ex);
        return;
    }
    // emit data at once
    this.emit('data', data);
    this.emit('end');
};

module.exports = HttpProtocolBase;
