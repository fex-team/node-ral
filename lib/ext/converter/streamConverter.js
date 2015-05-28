/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/12/23
 */

'use strict';

var Converter = require('../../converter.js');
// var logger = require('../../logger.js')('StreamConverter');
var util = require('util');
var PassThrough = require('stream').PassThrough;


function StreamConverter() {
    Converter.call(this);
}

util.inherits(StreamConverter, Converter);

StreamConverter.prototype.unpack = function (config, data) {
    return new PassThrough();
};

StreamConverter.prototype.pack = function (config, data) {
    return data;
};

StreamConverter.prototype.getName = function () {
    return 'stream';
};

StreamConverter.prototype.isStreamify = true;

module.exports = StreamConverter;
