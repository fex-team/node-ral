/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/5
 */

/* eslint-env node, mocha */

'use strict';

var Balance = require('../../balance.js');
var logger = require('../../logger.js')('RandomBalance');
var util = require('util');

function RandomBalance() {
    Balance.call(this);
}

util.inherits(RandomBalance, Balance);

RandomBalance.prototype.getName = function () {
    return 'random';
};

RandomBalance.prototype.fetchServer = function (balanceContext) {
    var servers = balanceContext.reqIDCServers;
    if (servers.length === 1) {
        return servers[0];
    }
    // Math.random takes 250ms on first call
    var index = Math.floor(Math.random() * servers.length);
    logger.trace('RandomBalance fetchServer index=' + index + ' ServiceID=' + balanceContext.serviceID);
    // TODO add server filter
    return servers[index];
};

module.exports = RandomBalance;
