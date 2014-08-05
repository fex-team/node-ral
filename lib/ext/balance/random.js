/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/5
 */

'use strict';

var Balance = require('../../balance.js').Balance;
var logger = require('../../logger.js')('RandomBalance');

function RandomBalance(){

}

RandomBalance.prototype = new Balance();

RandomBalance.prototype.constructor = RandomBalance;

RandomBalance.prototype.fetchServer = function(balanceContext){
    var servers = balanceContext.reqIDCServers;
    if (servers.length === 1){
        return servers[0];
    }
    //Math.random takes 250ms on first call
    var index = Math.floor(Math.random() * servers.length);
    logger.trace('RandomBalance fetchServer index=' + index);
    //TODO add server filter
    return servers[index];
};

module.exports = RandomBalance;