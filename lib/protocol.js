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

Procotol.prototype.talk = function(context, request){
    throw new Error('Not Implemented');
};

Procotol.prototype._prepareOptions = function(context, request){
    this.server = request.server;
    this.payload = request.payload;
    if (request.options){
        //extend options with request options
        var contextClass = this.getContext();
        var requestContext = new contextClass(context.serviceID, request.options);
        this.options = deepExtend(context.getOptions(), requestContext.getOptions());
    }else{
        this.options = context.getOptions();
    }
};

/**
 * start request
 * @param protocolContext
 * @param request
 */
Procotol.prototype.talk = function(protocolContext, request){
    //should emit the data event to return stream
    this.emit('data', null);
    //should emit end and return the response info
    this.emit('end', null);
};

function ProtocolContext(serviceID, service){
    var me = this;
    me.timeout = service.timeout;
    me.serviceID = serviceID;
    logger.trace('ProtocolContext created succ ServiceID=' + serviceID);
}

ProtocolContext.prototype.getOptions = function(){
    var options = {};
    this._extendProperty(options, 'timeout');
    this._extendProperty(options, 'serviceID');
    return options;
};

ProtocolContext.prototype._extendProperty = function(object, property){
    if (this[property]){
        object[property] = _.clone(this[property]);
    }
};

module.exports.Protocol = Procotol;
module.exports.ProtocolContext = ProtocolContext;