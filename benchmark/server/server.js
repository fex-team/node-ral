/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/16
 */

'use strict';

var http = require('http');

http.createServer(function (request, response) {
    response.writeHead(200);
    response.end();
}).listen(8192);
