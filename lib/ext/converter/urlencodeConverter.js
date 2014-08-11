/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/7
 */

'use strict';

var Converter = require('../../converter.js');
var logger = require('../../logger.js')('UrlencodeConverter');
var util = require('util');
var Stream = require('stream').Stream;
var Readable = require('stream').Readable;
var urlencode = require('urlencode');

function UrlDecodeStream(encoding){
    this.writable=true;
    this.data = null;
    this.chunks = [];
    this.encoding = encoding;
}

util.inherits(UrlDecodeStream, Stream);

UrlDecodeStream.prototype.write=function(data){
    try {
        var object = urlencode.parse(data.toString(), {
            charset: this.encoding
        });
        logger.trace('unpack urlencode succ');
        this.emit('data', object);
    } catch (ex) {
        logger.trace('unpack urlencode failed');
        this.emit('error', ex);
    }
};

UrlDecodeStream.prototype.end=function(){
    this.emit('end');
};

function UrlEncodeConverter() {
    Converter.call(this);
}

util.inherits(UrlEncodeConverter, Converter);

UrlEncodeConverter.prototype.unpack = function (config) {
    return new UrlDecodeStream(config.encoding);
};

UrlEncodeConverter.prototype.pack = function (config, data) {
    data = data || {};
    var buffer, rs = new Readable();
    try{
        buffer = urlencode.stringify(data, {
            charset: config.encoding
        });
        rs._read = function(){
            rs.push(buffer);
            rs.push(null);
        };
    }catch(e){
        logger.notice('pack urlencode data failed data=' + data + ' ServiceID=' + config.serviceID);
        throw e;
    }
    config.headers = config.headers || {};
    config.headers['Content-Type'] =
        "application/x-www-form-urlencoded; charset=" +
        (config.encoding ? config.encoding : 'utf-8');
    logger.trace('pack urlencode data succ ServiceID=' + config.serviceID);
    return rs;
};

UrlEncodeConverter.prototype.getName = function () {
    return 'urlencode';
};

module.exports = UrlEncodeConverter;
module.exports.UrlDecodeStream = UrlDecodeStream;