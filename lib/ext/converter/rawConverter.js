/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/11
 */

'use strict';


var Converter = require('../../converter.js');
var logger = require('../../logger.js')('RawConverter');
var util = require('util');
var iconv = require('iconv-lite');
var Stream = require('stream').Stream;

function RawStream() {
    this.writable = true;
    this.data = null;
}

util.inherits(RawStream, Stream);

RawStream.prototype.write = function (data) {
    this.emit('data', data);
};

RawStream.prototype.end = function () {
    this.emit('end');
};

function RawConverter() {
    Converter.call(this);
}

util.inherits(RawConverter, Converter);

RawConverter.prototype.unpack = function (config) {
    return new RawStream();
};

RawConverter.prototype.pack = function (config, data) {
    return data;
};

RawConverter.prototype.getName = function () {
    return 'raw';
};

module.exports = RawConverter;