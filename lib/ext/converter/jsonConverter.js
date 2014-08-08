/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/5
 */

'use strict';

var Converter = require('../../converter.js');
var logger = require('../../logger.js')('JsonConverter');
var util = require('util');
var Readable = require('stream').Readable;
var Stream = require('stream').Stream;
var iconv = require('iconv-lite');

function JsonParserStream(encoding){
    this.writable=true;
    this.data = null;
    this.chunks = [];
    this.encoding = encoding;
}

util.inherits(JsonParserStream,Stream);

JsonParserStream.prototype.write=function(chunk){
    this.chunks.push(chunk);
    this.emit('data', chunk);
};

JsonParserStream.prototype.end=function(){
    try {
        var str = iconv.decode(Buffer.concat(this.chunks), this.encoding);
        this.data = JSON.parse(str);
        logger.trace('unpack json data succ');
        this.emit('end', this.data);
    } catch (ex) {
        logger.trace('unpack json data failed');
        this.emit('error', ex);
    }
};

function JsonConverter(){
    Converter.call(this);
}

util.inherits(JsonConverter, Converter);

JsonConverter.prototype.unpack = function(options){
    return new JsonParserStream(options.encoding);
};

JsonConverter.prototype.pack = function(options, data){
    data = data || {};
    var buffer, rs = new Readable();
    try{
        buffer = iconv.encode(JSON.stringify(data), options.encoding);
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

JsonConverter.prototype.getName = function(){
    return 'json';
};

module.exports = JsonConverter;