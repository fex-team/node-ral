/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/4
 */

'use strict';

var logger = require('./logger.js')('balance');
var ctx = require('./ctx.js');

/**
 * Create a balance chooser
 * @param balanceContext
 * @constructor
 */
function Balance(balanceContext){
    this.balanceCTX = balanceContext;
}

Balance.prototype.fetchServer = function(request){
    throw new Error('Not Implemented');
};

/**
 * Convert Service Info into BalanceContext
 * Will update when service info changed
 * @param serviceID
 * @param service
 * @constructor
 */
function BalanceContext(serviceID, service){
    var me = this;
    //save idc info for future feature
    me.currentIDC = ctx.currentIDC;
    me.reqIDCServers = [];
    me.crossIDCServers = [];
    service.server.forEach(function(server){
        //get server list with same idc
        if (server.idc === me.currentIDC || !server.idc || me.currentIDC === ctx.IDC_ALL){
            me.reqIDCServers.push(server);
        }else{
            me.crossIDCServers.push(server);
        }
    });
    if (me.reqIDCServers.length === 0){
        logger.warning('Current IDC server count for ' + serviceID + ' is zero, use cross idc server');
        me.reqIDCServers = service.server;
    }
    logger.trace('BalanceContext for ' + serviceID + ' created succ');
}

module.exports.BalanceContext = BalanceContext;
module.exports.Balance = Balance;