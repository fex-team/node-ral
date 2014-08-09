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

Procotol.prototype.normalizeConfig = Procotol.normalizeConfig = function(context){
    return context;
};

/**
 * communicate with server
 * @param config
 */
Procotol.prototype.talk = function(config){
    return this._request(config);
};

Procotol.prototype.getCategory = function(){
    return 'protocol';
};

/**
 * actual request function, need to be implemented
 * @param config
 * @private
 */
Procotol.prototype._request = function(config){
    throw new Error('Not Implemented');
};

module.exports = Procotol;
