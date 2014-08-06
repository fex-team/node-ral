/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/6
 */
'use strict';
var http = require('http');
var url = require('url');
var qs = require('qs');
var formidable = require('formidable');
var formData = require('form-data');
var fs = require('fs');

module.exports.service = {
    timeout: 1000,
    path: '/hello',
    method: 'POST'
};

var form = new formData();
form.append('name', 'hefangshi');
form.append('passwd', 'what');
form.append('file', fs.createReadStream(__dirname + '/' + 'http_protocol_post_test.js'));


module.exports.request = {
    server : {
        host : '127.0.0.1',
        port : 8934
    },
    payload: form,
    options : {
        headers : {
            "Content-Type": "multipart/form-data"
        }
    }
};

module.exports.request_404 = {
    options: {
        path: '/404'
    },
    server : {
        host : '127.0.0.1',
        port : 8934
    }
};

module.exports.request_503 = {
    options: {
        path: '/error'
    },
    server : {
        host : '127.0.0.1',
        port : 8934
    }
};

module.exports.request_with_query = {
    options: {
        path: '/hello',
        query: {
            name: 'hefangshi'
        }
    },
    server : {
        host : '127.0.0.1',
        port : 8934
    }
};

module.exports.createServer = function(){
    return http.createServer(function (request, response) {
        var info = url.parse(request.url);
        var pathname =info.pathname;
        if (pathname === '/hello' && request.method === 'POST') {
            response.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            var content = 'hear you';

            var formIn = new formidable.IncomingForm();
            formIn.parse(request, function(err, fields, files) {
                response.writeHead(200, {'content-type': 'text/plain'});
                response.write('received upload:\n\n');
                response.end();
            });
        }else if (pathname === '/error' && request.method === 'POST'){
            response.writeHead(503, {
                'Content-Type': 'text/plain'
            });
            response.end();
        }else{
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            response.write('404');
            response.end();
        }
    }).listen(8934);
};