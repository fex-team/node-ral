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

Procotol.prototype.getContext = function(){
    return ProtocolContext;
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

module.exports.Protocol = Procotol;
module.exports.ProtocolContext = ProtocolContext;