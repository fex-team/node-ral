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
    this.encoding = encoding;
}

util.inherits(JsonParserStream,Stream);

JsonParserStream.prototype.write=function(data){
    try {
        var str = iconv.decode(data, this.encoding);
        var obj = JSON.parse(str);
        logger.trace('unpack json data succ');
        this.emit('data', obj);
    } catch (ex) {
        logger.trace('unpack json data failed');
        this.emit('error', ex);
    }
};

JsonParserStream.prototype.end=function(){
    this.emit('end');
};

function JsonConverter(){
    Converter.call(this);
}

util.inherits(JsonConverter, Converter);

JsonConverter.prototype.unpack = function(config){
    return new JsonParserStream(config.encoding);
};

JsonConverter.prototype.pack = function(config, data){
    data = data || {};
    var buffer, rs = new Readable();
    try{
        buffer = iconv.encode(JSON.stringify(data), config.encoding);
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

JsonConverter.prototype.getName = function(){
    return 'json';
};

module.exports = JsonConverter;