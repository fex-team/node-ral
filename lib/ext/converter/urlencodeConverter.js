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

UrlEncodeConverter.prototype.unpack = function (context) {
    return new UrlDecodeStream(context.encoding);
};

UrlEncodeConverter.prototype.pack = function (context, data) {
    data = data || {};
    var buffer, rs = new Readable();
    try{
        buffer = urlencode.stringify(data, {
            charset: context.encoding
        });
        rs._read = function(){
            rs.push(buffer);
            rs.push(null);
        };
    }catch(e){
        logger.notice('pack urlencode data failed data=' + data + ' ServiceID=' + context.serviceID);
        throw e;
    }
    context.headers = context.headers || {};
    context.headers['Content-Type'] =
        "application/x-www-form-urlencoded; charset=" +
        (context.encoding ? context.encoding : 'utf-8');
    logger.trace('pack urlencode data succ ServiceID=' + context.serviceID);
    return rs;
};

UrlEncodeConverter.prototype.getName = function () {
    return 'urlencode';
};

module.exports = UrlEncodeConverter;
module.exports.UrlDecodeStream = UrlDecodeStream;