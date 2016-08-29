/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2016/8/18
 */

'use strict';

var ralP = require('./ral.js');
var assert = require('assert');
ralP('REDIS', {
    // redis method
    method: 'set',
    data: {
        key: 'foo',
        value: 'bar'
    }
}).then(function (data) {
    return ralP('REDIS', {
        // redis method
        method: 'get',
        data: {
            key: 'foo',
        }
    });
}).then(function (data) {
    assert.ok(data === 'bar');
    return ralP('REDIS', {
        // redis method
        method: 'get',
        data: {
            key: 'foo',
        }
    });
}).then(function (data) {
    assert.ok(data === 'bar');
    return ralP('REDIS', {
        // redis method
        method: 'get',
        data: 'foo'
    });
}).then(function (data) {
    assert.ok(data === 'bar');
}).catch(function (err) {
    console.log(err);
});
