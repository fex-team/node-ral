/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/8
 */

'use strict';

var http = require('http');
var url = require('url');
var urlencode = require('urlencode');
var formidable = require('formidable');
var fs = require('fs');
var path = require('path');

module.exports.bookService = function(port, encoding) {
    return http.createServer(function(request, response) {
        var info = url.parse(request.url);
        var pathname = info.pathname;
        if (pathname === '/error') {
            response.writeHead(503, {
                'Content-Type': 'text/plain',
            });
            response.end();
        } else if (pathname === '/404') {
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            response.write('404');
            response.end();
        } else if (pathname === '/largecontent') {
            response.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            fs.createReadStream(path.join(__dirname, './data/bigone.json')).pipe(response);
        } else if (pathname === '/timeout') {
            response.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            var str = JSON.stringify({
                port: port,
                query: urlencode.parse(info.query)
            });
            response.write(str.slice(0, 1));
            setTimeout(function() {
                response.write(str.slice(1));
                response.end();
            }, 200);
        } else if (pathname === '/content') {
            response.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            response.write('aabb');
            response.end();
        } else if (pathname === '/close') {
            this.close();
        } else {
            response.writeHead(200, {
                'Content-Type': 'application/json'
            });
            if (request.method === 'POST') {
                var formIn = new formidable.IncomingForm();
                formIn.encoding = encoding || 'utf-8';
                formIn.parse(request, function(err, fields) {
                    response.write(JSON.stringify({
                        port: port,
                        query: fields
                    }));
                    response.end();
                });
            } else {
                response.write(JSON.stringify({
                    port: port,
                    query: urlencode.parse(info.query)
                }));
                response.end();
            }
        }
    }).listen(port);
};

module.exports.oddFail = function(port, encoding) {
    var count = 1;
    return http.createServer(function(request, response) {
        if (count % 2 === 1) {
            response.writeHead(500, {
                'Content-Type': 'text/plain',
            });
            response.end(request.url);
        } else {
            response.writeHead(200, {
                'Content-Type': 'text/plain',
            });
            response.end(request.url);
        }
        count++;
    }).listen(port);
};
