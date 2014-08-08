/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/4
 */

'use strict';

var logger = require('./logger.js')('Protocol');
var RalModule = require('./ralmodule.js');
var util = require('util');

function Procotol(){
    RalModule.call(this);
}

util.inherits(Procotol, RalModule);

Procotol.prototype.normalizeContext = Procotol.normalizeContext = function(context){
    return context;
};

/**
 * communicate with server
 * @param options
 */
Procotol.prototype.talk = function(options){
    return this._request(options);
};

Procotol.prototype.getCategory = function(){
    return 'protocol';
};

/**
 * actual request function, need to be implemented
 * @param options
 * @private
 */
Procotol.prototype._request = function(options){
    throw new Error('Not Implemented');
};

module.exports = Procotol;
