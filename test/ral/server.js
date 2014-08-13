/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/8
 */

'use strict';

var http = require('http');
var url = require('url');
var urlencode = require('urlencode');
var fs = require('fs');
var path = require('path');

module.exports.bookService = function(port, encoding){
    return http.createServer(function (request, response) {
        var info = url.parse(request.url);
        var pathname =info.pathname;
        if (pathname === '/error'){
            response.writeHead(503, {
                'Content-Type': 'text/plain'
            });
            response.end();
        }else if (pathname === '/404'){
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            response.write('404');
            response.end();
        }else if (pathname === '/largecontent'){
            response.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            fs.createReadStream(__dirname + path.sep + './data/bigone.json').pipe(response);
        }else if (pathname === '/timeout'){
            response.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            var str = JSON.stringify({
                port: port,
                query: urlencode.parse(info.query)
            });
            response.write(str.slice(0, 1));
            setTimeout(function(){
                response.write(str.slice(1));
                response.end();
            },200)
        }else{
            response.writeHead(200, {
                'Content-Type': 'application/json'
            });
            response.write(JSON.stringify({
                port: port,
                query: urlencode.parse(info.query)
            }));
            response.end();
        }
    }).listen(port);
};