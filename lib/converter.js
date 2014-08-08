/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/4
 */

'use strict';

var logger = require('./logger.js')('Converter');
var RalModule = require('./ralmodule.js');
var util = require('util');


function Converter(){
    RalModule.call(this);
}

util.inherits(Converter, RalModule);

/**
 * pack data to buffer
 * @param data
 * @param options
 */
Converter.prototype.pack = function(options, data){
    throw new Error('Not Implemented');
};

/**
 * unpack buffer to data
 * @param options
 */
Converter.prototype.unpack = function(options){
    throw new Error('Not Implemented');
};

Converter.prototype.normalizeContext = Converter.normalizeContext = function(context){
    return context;
};

//function ConverterContext(serviceID, options){
//    options.serviceID = serviceID;
//    logger.trace('ConverterContext for ' + serviceID + ' created succ');
//    return options;
//}

module.exports = Converter;
//module.exports.ConverterContext = ConverterContext;