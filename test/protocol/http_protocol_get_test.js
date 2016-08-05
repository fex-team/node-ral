/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/6
 */
'use strict';
var http = require('http');
var url = require('url');
var urlencode = require('urlencode');
var zlib = require('zlib');

module.exports.__defineGetter__('service', function () {
    return {
        timeout: 1000,
        path: '/hello',
        method: 'GET'
    };
});

module.exports.request = {
    server: {
        host: '127.0.0.1',
        port: 8934
    }
};

module.exports.request404 = {
    path: '/404',
    server: {
        host: '127.0.0.1',
        port: 8934
    }
};

module.exports.request503 = {
    path: '/error',
    server: {
        host: '127.0.0.1',
        port: 8934
    }
};

module.exports.requestWithQuery = {
    path: '/hello',
    query: {
        name: 'hefangshi'
    },
    server: {
        host: '127.0.0.1',
        port: 8934
    }
};

module.exports.requestWithQueryInPath = {
    path: '/hello?a=1',
    query: {
        name: 'hefangshi'
    },
    server: {
        host: '127.0.0.1',
        port: 8934
    }
};

module.exports.requestHttps = {
    https: true,
    method: 'GET',
    path: '/',
    rejectUnauthorized: false,
    server: {
        host: 'travis-ci.org',
        port: 443
    }
};

module.exports.requestHttpsWithProtocol = {
    method: 'GET',
    path: '/',
    rejectUnauthorized: false,
    server: {
        host: 'travis-ci.org',
        port: 443
    }
};

var server;


module.exports.createServer = function () {
    if (server) {
        try {
            server.close();
        }
        catch (e) {}
        server.close = function () {};
    }
    server = http.createServer(function (request, response) {
        var info = url.parse(request.url);
        var pathname = info.pathname;
        if (pathname === '/hello') {
            response.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            var content = 'hear you';
            if (info.query) {
                info.query = urlencode.parse(info.query);
                if (info.query.name) {
                    content += ' ' + info.query.name;
                }
            }
            response.write(content);
            // var padding = [];
            for (var i = 0; i < 100000; i++) {
                response.write(i.toString());
            }
            response.write('end');
            response.end();
        }
        else if (pathname === '/gzip') {
            response.writeHead(200, {
                'Content-Type': 'text/plain',
                'Content-Encoding': 'gzip'
            });
            var content = 'hear you';
            if (info.query) {
                info.query = urlencode.parse(info.query);
                if (info.query.name) {
                    content += ' ' + info.query.name;
                }
            }
            zlib.gzip(content, function (err, compressed) {
                response.write(compressed);
                response.end();
            });    
        } else if (pathname === '/gziperror') {
            response.writeHead(200, {
                'Content-Type': 'text/plain',
                'Content-Encoding': 'gzip'
            });
            var content = 'hear you';
            if (info.query) {
                info.query = urlencode.parse(info.query);
                if (info.query.name) {
                    content += ' ' + info.query.name;
                }
            }
            zlib.gzip(content, function (err, compressed) {
                response.write(compressed.slice(0, compressed.length / 2));
                response.end();
            });
        }  else if (pathname === '/deflate') {
            response.writeHead(200, {
                'Content-Type': 'text/plain',
                'Content-Encoding': 'deflate'
            });
            var content = 'hear you';
            if (info.query) {
                info.query = urlencode.parse(info.query);
                if (info.query.name) {
                    content += ' ' + info.query.name;
                }
            }
            zlib.deflate(content, function (err, compressed) {
                response.write(compressed);
                response.end();
            });    
        }
        else if (pathname === '/error') {
            response.writeHead(503, {
                'Content-Type': 'text/plain'
            });
            response.end();
        }
        else {
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            response.write('404');
            response.end();
        }
    }).listen(8934);
    return server;
};
