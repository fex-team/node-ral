/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/6
 */
'use strict';
var http = require('http');
var url = require('url');
var urlencode = require('urlencode');
var formidable = require('formidable');
var formData = require('form-data');
var fs = require('fs');
var CombinedStream = require('combined-stream');
var iconv = require('iconv-lite');
iconv.extendNodeEncodings();

module.exports.__defineGetter__('service', function(){
    return {
        timeout: 1000,
        path: '/hello',
        method: 'POST'
    };
});

var form = new formData();
form.append('name', 'hefangshi');
form.append('passwd', 'what');
form.append('file', fs.createReadStream(__dirname + '/' + 'http_protocol_post_test.js'));


module.exports.__defineGetter__('request',function() {
    return {
        server: {
            host: '127.0.0.1',
            port: 8934
        },
            headers:{'Content-Type':"multipart/form-data;boundary=" + form.getBoundary()
        },
        payload: form
    };
});


//create a buffer stream
var combinedStream = CombinedStream.create();
combinedStream.append(new Buffer(urlencode.stringify({name:'hefangshi'})));

module.exports.request_with_urlencode = {
    server : {
        host : '127.0.0.1',
        port : 8934
    },
    headers : {
        'Content-Type' : 'application/x-www-form-urlencoded; charset=utf-8'
    },
    payload: combinedStream
};

//create a buffer stream
var gbkStream = CombinedStream.create();
gbkStream.append(new Buffer(urlencode.stringify({name:'何方石'}, {charset: 'gbk'})));

module.exports.request_with_gbk = {
    server : {
        host : '127.0.0.1',
        port : 8934
    },
    encoding : 'gbk',
    headers : {
        'Content-Type' :  "application/x-www-form-urlencoded; charset=gbk"
    },
    payload: gbkStream
};

var gbk_form = new formData();
gbk_form.append('name', iconv.encode('何方石','gbk'));
gbk_form.append('passwd', 'what');
gbk_form.append('file', fs.createReadStream(__dirname + '/' + 'http_protocol_post_test.js'));


module.exports.request_gbk_form = {
    server : {
        host : '127.0.0.1',
        port : 8934
    },
    encoding : 'gbk',
    headers : {
        'Content-Type' : "multipart/form-data;boundary=" + gbk_form.getBoundary()
    },
    payload: gbk_form
};

module.exports.request_404 = {
    path: '/404',
    server : {
        host : '127.0.0.1',
        port : 8934
    }
};

module.exports.request_503 = {
    path: '/error',
    server : {
        host : '127.0.0.1',
        port : 8934
    }
};

module.exports.request_with_query = {
    path: '/hello',
    query: {
        name: 'hefangshi'
    },
    server : {
        host : '127.0.0.1',
        port : 8934
    }
};

module.exports.createServer = function(encoding){
    return http.createServer(function (request, response) {
        var info = url.parse(request.url);
        var pathname =info.pathname;
        if (pathname === '/hello' && request.method === 'POST') {
            var content = 'hear you';
            var formIn = new formidable.IncomingForm();
            formIn.encoding = encoding || 'utf-8';
            formIn.parse(request, function(err, fields, files) {
                response.writeHead(200, {'content-type': 'text/plain'});
                if (fields.name){
                    content += ' ' +fields.name;
                }
                if (files.file){
                    content += ' with file ' + files.file.name;
                }
                response.write(content);
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