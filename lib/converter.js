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
 * @param config
 */
Converter.prototype.pack = function(config, data){
    throw new Error('Not Implemented');
};

/**
 * unpack stream to data
 * @param config
 */
Converter.prototype.unpack = function(config){
    throw new Error('Not Implemented');
};

Converter.prototype.getCategory = function(){
    return 'converter';
};

module.exports = Converter;