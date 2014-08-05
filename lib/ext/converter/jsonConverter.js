/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/5
 */

'use strict';

var Converter = require('../../converter.js').Converter;
var ConverterContext = require('../../converter.js').ConverterContext;
var logger = require('../../logger.js')('JsonConverter');

function JsonConverter(){

}

JsonConverter.prototype = new Converter();

JsonConverter.prototype.constructor = JsonConverter;

JsonConverter.prototype.unpack = function(convertContext, buffer){
    var data, obj;
    try {
        data = this.decode(buffer, convertContext.encoding);
        obj = JSON.parse(data);
    }catch(e){
        logger.warning('unpack json data failed ' + ' ServiceID=' + convertContext.serviceID);
        throw e;
    }
    logger.trace('unpack json data succ ServiceID=' + convertContext.serviceID);
    return obj;
};

JsonConverter.prototype.pack = function(convertContext, data){
    var buffer;
    try{
        buffer = this.encode(JSON.stringify(data), convertContext.encoding);
    }catch(e){
        logger.warning('pack json data failed data=' + data + ' ServiceID=' + convertContext.serviceID);
        throw e;
    }
    logger.trace('pack json data succ ServiceID=' + convertContext.serviceID);
    return buffer;
};

JsonConverter.prototype.getName = function(){
    return 'json';
};

module.exports = JsonConverter;