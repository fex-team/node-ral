/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/11
 */

'use strict';


var Converter = require('../../converter.js');
// var logger = require('../../logger.js')('RawConverter');
var util = require('util');

function RawConverter() {
    Converter.call(this);
}

util.inherits(RawConverter, Converter);

RawConverter.prototype.unpack = function (config, data) {
    return data;
};

RawConverter.prototype.pack = function (config, data) {
    config.headers = config.headers || {};
    config.headers['Content-Length'] = data.length;
    return data;
};

RawConverter.prototype.getName = function () {
    return 'raw';
};

module.exports = RawConverter;
