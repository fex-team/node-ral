/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/5
 */

'use strict';

var Balance = require('../../balance.js').Balance;
var BalanceContext = require('../../balance.js').BalanceContext;
var logger = require('../../logger.js')('RoundRobinBalance');

function RoundRobinBalance(){
}

RoundRobinBalance.prototype = new Balance();

RoundRobinBalance.prototype.constructor = RoundRobinBalance;

RoundRobinBalance.prototype.getName = function(){
    return 'roundrobin';
};

RoundRobinBalance.prototype.fetchServer = function(balanceContext){
    var servers = balanceContext.reqIDCServers;
    if (servers.length === 1){
        return servers[0];
    }
    balanceContext.lastRoundRobinID = balanceContext.lastRoundRobinID || 0;
    balanceContext.lastRoundRobinID++;
    if (balanceContext.lastRoundRobinID < 0 || balanceContext.lastRoundRobinID >= servers.length){
        balanceContext.lastRoundRobinID = 0;
    }
    logger.trace('RoundRobinBalance fetchServer RoundRobinID=' + balanceContext.lastRoundRobinID + ' ServiceID=' + balanceContext.serviceID);
    return servers[balanceContext.lastRoundRobinID];
};

module.exports = RoundRobinBalance;
