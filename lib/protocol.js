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

/**
 * actual request function, need to be implemented
 * @param options
 * @private
 */
Procotol.prototype._request = function(options){
    throw new Error('Not Implemented');
};

/**
 * merge options from request and service config
 * @param context
 * @param request
 * @returns {{}}
 * @private
 */
//Procotol.prototype._prepareOptions = function(context, request){
//    var options = {};
//    if (request.options){
//        //extend options with request options
//        var contextClass = this.getContextClass();
//        //use context to normalize request options
//        var requestContext = new contextClass(context.serviceID, request.options);
//        options = deepExtend(context.getOptions(), requestContext.getOptions());
//    }else{
//        options = context.getOptions();
//    }
//    //save request server and payload
//    options.server = request.server;
//    options.payload = request.payload;
//    return options;
//};

/**
 * Context to store service protocol options
 * @param serviceID
 * @param options
 * @constructor
 */
//function ProtocolContext(serviceID, options){
//    options.serviceID = serviceID;
//    logger.trace('ProtocolContext created succ ServiceID=' + serviceID);
//    return options;
//}

//ProtocolContext.prototype._extendProperty = function(object, property){
//    if (this[property]){
//        object[property] = _.clone(this[property]);
//    }
//};

module.exports.Protocol = Procotol;
//module.exports.ProtocolContext = ProtocolContext;