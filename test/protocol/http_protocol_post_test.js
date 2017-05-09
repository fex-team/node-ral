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
var formidable = require('formidable');
var FormDataCls = require('form-data');
var fs = require('fs');
var CombinedStream = require('combined-stream');
var iconv = require('iconv-lite');
var path = require('path');

module.exports.__defineGetter__('service', function () {
    return {
        timeout: 1000,
        path: '/hello',
        method: 'POST'
    };
});

var form = new FormDataCls();
form.append('name', 'hefangshi');
form.append('passwd', 'what');
form.append('file', fs.createReadStream(path.join(__dirname, 'http_protocol_post_test.js')));


module.exports.__defineGetter__('request', function () {
    return {
        server: {
            host: '127.0.0.1',
            port: 8934
        },
        headers: {
            'Content-Type': 'multipart/form-data;boundary=' + form.getBoundary()
        },
        data: form
    };
});

// create a buffer stream
var combinedStream = CombinedStream.create();
combinedStream.append(new Buffer(urlencode.stringify({
    name: 'hefangshi'
})));

module.exports.requestWithUrlencode = {
    server: {
        host: '127.0.0.1',
        port: 8934
    },
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
    },
    data: combinedStream
};
// create a buffer stream
var gbkStream = CombinedStream.create();
gbkStream.append(new Buffer(urlencode.stringify({
    name: '何方石'
}, {
    charset: 'gbk'
})));

module.exports.requestWithGBK = {
    server: {
        host: '127.0.0.1',
        port: 8934
    },
    encoding: 'gbk',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=gbk'
    },
    data: gbkStream
};

var gbkForm = new FormDataCls();
gbkForm.append('name', iconv.encode('何方石', 'gbk'));
gbkForm.append('passwd', 'what');
gbkForm.append('file', fs.createReadStream(path.join(__dirname, 'http_protocol_post_test.js')));


module.exports.requestGBKForm = {
    server: {
        host: '127.0.0.1',
        port: 8934
    },
    encoding: 'gbk',
    headers: {
        'Content-Type': 'multipart/form-data;boundary=' + gbkForm.getBoundary()
    },
    data: gbkForm
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


var server;
module.exports.closeServer = function () {
    if (server) {
        try {
            server.close();
        }
        catch (e) {}
        server.close = function () {};
    }
};

module.exports.createServer = function (encoding) {
    module.exports.closeServer();
    server = http.createServer(function (request, response) {
        var info = url.parse(request.url);
        var pathname = info.pathname;
        if (pathname === '/hello' && request.method === 'POST') {

            var formIn = new formidable.IncomingForm();
            // var decodeStream = iconv.decodeStream(encoding || 'utf-8');
            // decodeStream.headers = request.headers;
            // decodeStream.rawHeaders = request.rawHeaders;
            // decodeStream.httpVersionMajor = request.httpVersionMajor;
            // decodeStream.httpVersionMinor = request.httpVersionMinor;
            // decodeStream.httpVersion = request.httpVersion;
            // decodeStream.trailers = request.trailers;
            // decodeStream.rawTrailers = request.rawTrailers;
            // decodeStream.url = request.url;
            // decodeStream.method = request.method;
            // decodeStream.statusCode = request.statusCode;
            // decodeStream.statusMessage = request.statusMessage;
            formIn.parse(request, function (err, fields, files) {

                var content = 'hear you';
                response.writeHead(200, {
                    'content-type': 'text/plain'
                });
                if (fields.name) {
                    content += ' ' + fields.name;
                }
                if (files.file) {
                    content += ' with file ' + files.file.name;
                }
                response.write(content);
                var padding = [];
                for (var i = 0; i < 1000; i++) {
                    response.write(i.toString());
                }
                response.write('end');
                // response.write(padding.join());
                response.end();
            });
            // request.pipe(decodeStream);
        }
        else if (pathname === '/error' && request.method === 'POST') {
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
