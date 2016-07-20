/**
 * @file node-ralP
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2015/5/10
 */

/* eslint-disable no-console */

'use strict';

var ralP = require('./ral.js');
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var GIF = path.join(__dirname, 'baidu.gif');

// 使用文件流上传图片，不需要等文件完全读完就可以开始上传
ralP('PIC_UPLOAD', {
    data: {
        MAX_FILE_SIZE: 200000000,
        uploadimg: fs.createReadStream(GIF)
    }
}).then(function (data) {
    var uploadimg = data.match(/http:\/\/chuantu\.biz\/.*\.gif/img)[0];
    console.log('pic url:', uploadimg);
    assert.ok(uploadimg);
}).catch(function (err) {
    assert.fail(err, null);
});

// 使用Buffer上传图片，需要等待文件全部读入Node后，才可以上传

var picData = fs.readFileSync(GIF);
picData.options = {
    filename: 'whatever.gif'
};

ralP('PIC_UPLOAD', {
    data: {
        MAX_FILE_SIZE: 200000000,
        uploadimg: picData
    }
}).then(function (data) {
    var uploadimg = data.match(/http:\/\/chuantu\.biz\/.*\.gif/img)[0];
    assert.ok(uploadimg);
}).catch(function (err) {
    assert.fail(err, null);
});
