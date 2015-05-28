/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/16
 */

'use strict';

var http = require('http');

http.createServer(function (request, response) {
    if (Math.random() > 0.99) {
        response.writeHead(503);
    }
    else {
        response.writeHead(200);
    }
    setTimeout(function () {
        response.end();
    }, 10);
}).listen(8192);
