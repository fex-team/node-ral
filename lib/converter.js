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
 * pack data to stream
 * @param data
 * @param options
 */
Converter.prototype.pack = function(options, data){
    throw new Error('Not Implemented');
};

/**
 * unpack stream to data
 * @param options
 */
Converter.prototype.unpack = function(options){
    throw new Error('Not Implemented');
};

Converter.prototype.getCategory = function(){
    return 'converter';
};

Converter.prototype.normalizeContext = Converter.normalizeContext = function(context){
    return context;
};

module.exports = Converter;