/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/4
 */

'use strict';

var logger = require('./logger.js')('Protocol');
var RalModule = require('./ralmodule.js');
var util = require('util');
var _ = require('underscore');
var deepExtend = require('deep-extend');

function Procotol(){
    RalModule.call(this);
}

util.inherits(Procotol, RalModule);

Procotol.prototype.getContext = function(){
    return ProtocolContext;
};

/**
 * communicate with server
 * @param context
 * @param request
 * @param callback
 */
Procotol.prototype.talk = function(context, request){
    var options = this._prepareOptions(context, request);
    return this._request(options);
};

/**
 * actual request function, need to be implemented
 * @param options
 * @param callback
 * @private
 */
Procotol.prototype._request = function(options, callback){
    throw new Error('Not Implemented');
};

/**
 * merge options from request and service config
 * @param context
 * @param request
 * @returns {{}}
 * @private
 */
Procotol.prototype._prepareOptions = function(context, request){
    var options = {};
    if (request.options){
        //extend options with request options
        var contextClass = this.getContext();
        //use context to normalize request options
        var requestContext = new contextClass(context.serviceID, request.options);
        options = deepExtend(context.getOptions(), requestContext.getOptions());
    }else{
        options = context.getOptions();
    }
    //save request server and payload
    options.server = request.server;
    options.payload = request.payload;
    return options;
};

/**
 * Context to store service protocol options
 * @param serviceID
 * @param service
 * @constructor
 */
function ProtocolContext(serviceID, service){
    var me = this;

    //might be set by subclasses
    me._optNames = me._optNames || [];
    me._optNames.push('timeout', 'serviceID');

    //get options from service
    me._optNames.forEach(function(property){
        me[property] =service[property];
    });
    me.timeout = service.timeout;
    me.serviceID = serviceID;
    logger.trace('ProtocolContext created succ ServiceID=' + serviceID);
}

ProtocolContext.prototype.getOptions = function(){
    var options = {};
    var me = this;
    me._optNames.forEach(function(property){
        me._extendProperty(options, property);
    });
    return options;
};

ProtocolContext.prototype._extendProperty = function(object, property){
    if (this[property]){
        object[property] = _.clone(this[property]);
    }
};

module.exports.Protocol = Procotol;
module.exports.ProtocolContext = ProtocolContext;