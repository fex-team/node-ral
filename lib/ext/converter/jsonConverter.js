/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/5
 */

'use strict';

var Converter = require('../../converter.js').Converter;
var logger = require('../../logger.js')('JsonConverter');

function JsonConverter(){

}

JsonConverter.prototype = new Converter();

JsonConverter.prototype.constructor = JsonConverter;

JsonConverter.prototype.unpack = function(convertContext, buffer){
    var data = this.decode(buffer, convertContext.encoding),
        obj;
    try {
        obj = JSON.parse(data);
    }catch(e){
        logger.warning('parse buffer to json failed data=' + data + ' ServiceID=' + convertContext.serviceID);
        throw e;
    }
    logger.trace('parse buffer to json succ ServiceID=' + convertContext.serviceID);
    return obj;
};

JsonConverter.prototype.pack = function(convertContext, data){
    var buffer = this.encode(JSON.stringify(data), convertContext.encoding);
    logger.trace('parse json to buffer succ ServiceID=' + convertContext.serviceID);
    return buffer;
};

JsonConverter.prototype.getName = function(){
    return 'json';
};

module.exports = JsonConverter;