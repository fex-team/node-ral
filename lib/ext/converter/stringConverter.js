/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/5
 */

'use strict';

var Converter = require('../../converter.js').Converter;
var ConverterContext = require('../../converter.js').ConverterContext;
var logger = require('../../logger.js')('StringConverter');

function StringConverter(){

}

StringConverter.prototype = new Converter();

StringConverter.prototype.constructor = StringConverter;

StringConverter.prototype.unpack = function(convertContext, buffer){
    var data = this.decode(buffer, convertContext.encoding);
    logger.trace('parse buffer to string succ ServiceID=' + convertContext.serviceID);
    return data;
};

StringConverter.prototype.pack = function(convertContext, data){
    var buffer = this.encode(data.toString(), convertContext.encoding);
    logger.trace('parse string to buffer succ ServiceID=' + convertContext.serviceID);
    return buffer;
};

StringConverter.prototype.getName = function(){
    return 'string';
};

module.exports = StringConverter;