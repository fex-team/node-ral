/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/7
 */

'use strict';

var Converter = require('../../converter.js').Converter;
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

UrlDecodeStream.prototype.write=function(chunk){
    this.chunks.push(chunk);
    this.emit('data', chunk);
};

UrlDecodeStream.prototype.end=function(){
    try {
        this.data = urlencode.parse(Buffer.concat(this.chunks).toString(), {
            charset: this.encoding
        });
        logger.trace('unpack urlencode succ');
        this.emit('end', this.data);
    } catch (ex) {
        logger.trace('unpack urlencode failed');
        this.emit('error', ex);
    }
};

function UrlEncodeConverter() {
    Converter.call(this);
}

util.inherits(UrlEncodeConverter, Converter);

UrlEncodeConverter.prototype.unpack = function (convertContext) {
    return new UrlDecodeStream(convertContext.encoding);
};

UrlEncodeConverter.prototype.pack = function (convertContext, data) {
    data = data || {};
    var buffer, rs = new Readable();
    try{
        buffer = urlencode.stringify(data, {
            charset: convertContext.encoding
        });
        rs._read = function(){
            rs.push(buffer);
            rs.push(null);
        };
    }catch(e){
        logger.notice('pack urlencode data failed data=' + data + ' ServiceID=' + convertContext.serviceID);
        throw e;
    }
    logger.trace('pack urlencode data succ ServiceID=' + convertContext.serviceID);
    return rs;
};

UrlEncodeConverter.prototype.getName = function () {
    return 'urlencode';
};

module.exports = UrlEncodeConverter;