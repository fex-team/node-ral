/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/5
 */

'use strict';

var Balance = require('../../balance.js');
var logger = require('../../logger.js')('RoundRobinBalance');
var util = require('util');

function RoundRobinBalance() {
    Balance.call(this);
}

util.inherits(RoundRobinBalance, Balance);

RoundRobinBalance.prototype.getName = function () {
    return 'roundrobin';
};

RoundRobinBalance.prototype.fetchServer = function (balanceContext) {
    var servers = balanceContext.reqIDCServers;
    if (servers.length === 1) {
        return servers[0];
    }
    balanceContext.lastRoundRobinID = balanceContext.lastRoundRobinID || 0;
    balanceContext.lastRoundRobinID++;
    if (balanceContext.lastRoundRobinID < 0 || balanceContext.lastRoundRobinID >= servers.length) {
        balanceContext.lastRoundRobinID = 0;
    }
    logger.trace(
        ['RoundRobinBalance fetchServer RoundRobinID=', balanceContext.lastRoundRobinID, ' ServiceID=',
            balanceContext.serviceID
        ].join('')
    );
    return servers[balanceContext.lastRoundRobinID];
};

module.exports = RoundRobinBalance;
