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

StringDecodeStream.prototype.write=function(data){
    try {
        var str = iconv.decode(data, this.encoding);
        logger.trace('unpack string succ');
        this.emit('data', str);
    } catch (ex) {
        logger.trace('unpack string failed');
        this.emit('error', ex);
    }
};

StringDecodeStream.prototype.end=function(){
    this.emit('end');
};

function StringConverter() {
    Converter.call(this);
}

util.inherits(StringConverter, Converter);

StringConverter.prototype.unpack = function (config) {
    return new StringDecodeStream(config.encoding);
};

StringConverter.prototype.pack = function (config, data) {
    data = data || '';
    var buffer, rs = new Readable();
    try{
        buffer = iconv.encode(data.toString(), config.encoding);
        rs._read = function(){
            rs.push(buffer);
            rs.push(null);
        };
    }catch(e){
        logger.notice('pack json data failed data=' + data + ' ServiceID=' + config.serviceID);
        throw e;
    }
    logger.trace('pack json data succ ServiceID=' + config.serviceID);
    return rs;
};

StringConverter.prototype.getName = function () {
    return 'string';
};

module.exports = StringConverter;