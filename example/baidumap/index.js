/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2015/5/10
 */
/* eslint-disable no-console */

'use strict';

var ral = require('./ral.js');
var assert = require('assert');

ral('MAPAPI', {
    data: {
        region: '北京',
        query: '奥林匹克森林公园'
    }
}).on('data', function (data) {
    assert.equal(data.status, 0);
    console.dir(data.results[0]);
}).on('error', function (err) {
    console.error(err);
});
