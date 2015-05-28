/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/4
 */

'use strict';

var logger = require('./logger.js')('Balance');
var ctx = require('./ctx.js');
var RalModule = require('./ralmodule.js');
var util = require('util');

/**
 * Create a balance chooser
 *
 * @constructor
 */
function Balance() {
    RalModule.call(this);
}

util.inherits(Balance, RalModule);

/**
 * get a server from server list
 *
 * @param  {Object} balanceContext [description]
 */
Balance.prototype.fetchServer = function (balanceContext) {
    throw new Error('Not Implemented');
};

/**
 * get context handle class
 *
 * @return {Class} [description]
 */
Balance.prototype.getContextClass = function () {
    return BalanceContext;
};

Balance.prototype.getCategory = function () {
    return 'balance';
};

/**
 * Convert Service Info into BalanceContext
 * Will update when service info changed
 *
 * @param {string} serviceID [description]
 * @param {Object} service   [description]
 */
function BalanceContext(serviceID, service) {
    var me = this;
    // save idc info for future feature
    me.currentIDC = ctx.currentIDC;
    me.serviceID = serviceID;
    me.reqIDCServers = [];
    me.crossIDCServers = [];
    service.server.forEach(function (server) {
        // get server list with same idc
        if (server.idc === me.currentIDC || !server.idc || me.currentIDC === ctx.IDC_ALL || service.hybird) {
            me.reqIDCServers.push(server);
        }
        else {
            me.crossIDCServers.push(server);
        }
    });
    if (me.reqIDCServers.length === 0) {
        // if there is no server in specify idc, use cross idc server
        logger.warning('Current IDC server is zero, use cross idc server ServiceID=' + serviceID);
        me.reqIDCServers = service.server;
    }
    logger.trace('BalanceContext created succ ServiceID=' + serviceID);
}

module.exports = Balance;
module.exports.BalanceContext = BalanceContext;
