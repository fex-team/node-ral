/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2016/4/27
 */

/* eslint-env node, mocha */

'use strict';

var Balance = require('../../balance.js');
var logger = require('../../logger.js')('HashringBalance');
var util = require('util');
var bs = require('binary-search');
var murmurhash = require('../../thirdparty/murmurhash3_gc.js');

function ip2long(ip) {
    var ipl = 0;
    ip.split('.').forEach(function (octet) {
        ipl <<= 8;
        ipl += parseInt(octet, 10);
    });
    return (ipl >>> 0);
}

function HashringBalance() {
    Balance.call(this);
}

util.inherits(HashringBalance, Balance);

HashringBalance.prototype.getName = function () {
    return 'hashring';
};

HashringBalance.prototype.createHashring = function (servers) {
    var vNodeSize = this.calcVNodeSize(servers.length);
    var ring = [];
    for (var i = 0; i < servers.length; i++) {
        var server = servers[i];
        var long = ip2long(server.host);
        for (var j = 0; j < vNodeSize; j++) {
            var hashKey = long + ':' + server.port + '#' + j;
            var hashValue = this.generateHash(hashKey);
            ring.push({
                index: i,
                value: hashValue
            });
        }
    }
    ring.sort(function (a, b) {
        return a.value - b.value;
    });
    return ring;
};

HashringBalance.prototype.calcVNodeSize = function (serverCount) {
    var rate = 0.25;
    var count = 256;
    return Math.max(1, Math.floor(count - serverCount * rate));
};

HashringBalance.prototype.generateHash = function (hashKey) {
    return murmurhash(hashKey.toString(), 20130710);
};

HashringBalance.prototype.fetchServer = function (balanceContext, conf, prevBackend) {
    if (conf.balanceKey === undefined || conf.balanceKey === null) {
        throw new Error('balanceKey is needed when using consistent hashing');
    }
    var servers = balanceContext.reqIDCServers;
    if (servers.length === 1) {
        return servers[0];
    }
    if (!balanceContext.hashring) {
        balanceContext.hashring = this.createHashring(balanceContext.reqIDCServers);
    }
    var ringIndex = bs(balanceContext.hashring, {
        index: null,
        value: this.generateHash(conf.balanceKey)
    }, function (a, b) {
        return a.value - b.value;
    });
    if (ringIndex < 0) {
        ringIndex = -ringIndex - 1;
    }
    ringIndex = Math.min(ringIndex, balanceContext.hashring.length - 1);
    var index = balanceContext.hashring[ringIndex].index;
    logger.trace('RandomBalance fetchServer index=' + index + ' ServiceID=' + balanceContext.serviceID);
    return servers[index];
};

module.exports = HashringBalance;
