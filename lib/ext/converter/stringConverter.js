/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/5
 */

'use strict';

var Converter = require('../../converter.js');
var logger = require('../../logger.js')('StringConverter');
var util = require('util');
var iconv = require('iconv-lite');
var Stream = require('stream').Stream;
var Readable = require('stream').Readable;

function StringDecodeStream(encoding){
    this.writable=true;
    this.data = null;
    this.chunks = [];
    this.encoding = encoding;
}

util.inherits(StringDecodeStream, Stream);

StringDecodeStream.prototype.write=function(chunk){
    this.chunks.push(chunk);
    this.emit('data', chunk);
};

StringDecodeStream.prototype.end=function(){
    try {
        this.data = iconv.decode(Buffer.concat(this.chunks), this.encoding);
        logger.trace('unpack string succ');
        this.emit('end', this.data);
    } catch (ex) {
        logger.trace('unpack string failed');
        this.emit('error', ex);
    }
};

function StringConverter() {
    Converter.call(this);
}

util.inherits(StringConverter, Converter);

StringConverter.prototype.unpack = function (options) {
    return new StringDecodeStream(options.encoding);
};

StringConverter.prototype.pack = function (options, data) {
    data = data || '';
    var buffer, rs = new Readable();
    try{
        buffer = iconv.encode(data.toString(), options.encoding);
        rs._read = function(){
            rs.push(buffer);
            rs.push(null);
        };
    }catch(e){
        logger.notice('pack json data failed data=' + data + ' ServiceID=' + options.serviceID);
        throw e;
    }
    logger.trace('pack json data succ ServiceID=' + options.serviceID);
    return rs;
};

StringConverter.prototype.getName = function () {
    return 'string';
};

module.exports = StringConverter;