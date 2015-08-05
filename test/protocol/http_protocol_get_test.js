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

module.exports.createServer = function () {
    return http.createServer(function (request, response) {
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
            response.end();
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
};
