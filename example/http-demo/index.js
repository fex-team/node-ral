var ral = require('./ral.js');
var assert = require('assert');

// 根据服务配置，使用GBK编码抓取百度文库首页
ral('DEMO', {
    data: {}
}).on('data', function (data) {
    assert.notEqual(data.indexOf('百度文库'), -1);
}).on('error', function (err) {
    assert.fail(err, null);
});

// // 使用UTF8编码抓取百度文库首页
ral('DEMO', {
    data: {},
    encoding: 'utf-8' // 修改编码格式
}).on('data', function (data) {
    // 由于编码错误，返回值中无法找到`百度文库`四个字
    assert.equal(data.indexOf('百度文库'), -1);
}).on('error', function (err) {
    assert.fail(err, null);
});


// // 抓取检索结果, 访问 http://wenku.baidu.com/search?word=Node.js
ral('DEMO', {
    // 由于pack设置为 querystring，数据会设置到query中
    data: {
        word: 'Node.js'
    },
    path: '/search', // 重写URL PATH
    timeout: 10000 // 增加超时时间
}).on('data', function (data) {
    assert.notEqual(data.indexOf('Node.js'), -1);
}).on('error', function (err) {
    assert.fail(err, null);
});

// // pack设置为form，提交POST请求，由于接口支持，也可以返回正确结果
ral('DEMO', {
    pack: 'form',
    method: 'POST',
    data: {
        word: 'Node.js'
    },
    path: '/search', // 重写URL PATH
    timeout: 10000 // 增加超时时间
}).on('data', function (data) {
    assert.notEqual(data.indexOf('Node.js'), -1);
}).on('error', function (err) {
    assert.fail(err, null);
});

// unpack设置为json，尝试将网页按照json解码，会提示解码失败
ral('DEMO', {
    data: {},
    unpack: 'json'
}).on('data', function (data) {
    assert.fail(data, null);
}).on('error', function (err) {
    assert.ok(err);
});