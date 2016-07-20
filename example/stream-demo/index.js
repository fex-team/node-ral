/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2015/5/10
 */

'use strict';

var ralP = require('./ral.js');
var assert = require('assert');


/**
stream 数据类型最常见的用途就是转发请求

这种方式的优点是转发数据可以节省前端数据的解包和打包时间，并且无需等待前端传回的数据接收完毕就可以发起转发请求

这种方式缺点是由于Node后端对传递的数据没有解包操作，所以无法知道具体传递的内容，也无法对传递的内容做修改

示例中，会像DEMO_SERVER发起一个search请求，DEMO_SERVER在接收到请求后，转发至wenku.baidu.com，并将接收的结果直接返回
**/

var http = require('http');
var server = http.createServer(function (req, res) {
    delete req.headers.host; // 删除host，避免后端识别host错误，绝大部分情况都建议这样处理
    /* 如果使用express，可以传递
        headers: req.headers, // 传递headers
        path: req.path, // 传递path
        query: req.query, // 传递query
        method: req.method // 传递method
    */
    ralP('PROXY', {
        data: req, // 直接将req作为stream源传递，主要是对body数据做流式转发
        headers: req.headers, // 传递headers
        path: req.url, // 传递url
        method: req.method, // 传递method
        includeExtras: true // 获取额外的头信息
    }).then(function (data) {
        res.statusCode = data._extras.statusCode;
        data.pipe(res);
    }).catch(function (err) {
        assert.fail(err, null);
    });
}).listen(9032);


// 请求发往 http://127.0.0.1:9032
ralP('DEMO_SERVER', {
    data: {
        word: 'Node.js'
    },
    path: '/search',
    query: 'st=3'
}).then(function (data) {
    server.close();
    // 接收到服务器返回的信息
    assert.notEqual(data.indexOf('Node.js'), -1);
}).catch(function (err) {
    server.close();
    assert.fail(err, null);
});
