var ral = require('./ral.js');
var assert = require('assert');
var fs = require('fs');

// 使用文件流上传图片，不需要等文件完全读完就可以开始上传
ral('PIC_UPLOAD', {
    data: {
        MAX_FILE_SIZE: 200000000,
        uploadimg: fs.createReadStream('./baidu.gif')
    }
}).on('data', function (data) {
    var uploadimg = data.match(/http:\/\/chuantu\.biz\/.*\.gif/img)[0];
    console.log('pic url:', uploadimg);
    assert.ok(uploadimg);
}).on('error', function (err) {
    assert.fail(err, null);
});

// 使用Buffer上传图片，需要等待文件全部读入Node后，才可以上传

var picData = fs.readFileSync('./baidu.gif');
picData.options = {
    filename: 'whatever.gif'
};

ral('PIC_UPLOAD', {
    data: {
        MAX_FILE_SIZE: 200000000,
        uploadimg: picData
    }
}).on('data', function (data) {
    var uploadimg = data.match(/http:\/\/chuantu\.biz\/.*\.gif/img)[0];
    assert.ok(uploadimg);
}).on('error', function (err) {
    assert.fail(err, null);
});