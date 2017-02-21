/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2016/08/18
 */

'use strict';

var Protocol = require('../../protocol.js');
var logger = require('../../logger.js')('RedisProtocol');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var redis = require('redis');
var clientCache = {};

function RedisProtocol() {
    Protocol.call(this);
}

util.inherits(RedisProtocol, Protocol);

RedisProtocol.prototype.getName = function () {
    return 'redis';
};

RedisProtocol.prototype.getConfigKey = function (config) {
    return [config.serviceID, config.server.host, config.server.port].join('_');
};

RedisProtocol.prototype.normalizeConfig = RedisProtocol.normalizeConfig = function (config) {
    config.redisConf = config.redisConf || {};
    // 关闭path与url定位，统一使用IP与端口
    config.redisConf.path = null;
    config.redisConf.url = null;
    // 默认关闭ready check
    if (config.redisConf.no_ready_check === undefined) {
        config.redisConf.no_ready_check = true;
    }
    return config;
};

RedisProtocol.prototype.createClient = function(config) {
    config.redisConf.host = config.server.host;
    config.redisConf.port = config.server.port;
    var configKey = this.getConfigKey(config);
    var client;
    if (!clientCache[configKey] || config.noClientCache) {
        config.redisConf.retry_strategy = function (options) {
            clientCache[configKey] = null;
            return undefined;
        }
        clientCache[configKey] = redis.createClient(config.redisConf);
        client = clientCache[configKey];
        client.on('connect', function () {
            logger.trace('Redis Server [' + configKey + '] Connected');
        });
        client.on('reconnecting', function () {
            logger.trace('Redis Server [' + configKey + '] start reconnecting.');
        });
        client.on('error', function (err) {
            clientCache[configKey] = null;
            logger.trace('Redis Server [' + configKey + '] encountering an error ' + err.message);
        });
    }
    return clientCache[configKey];
};

RedisProtocol.prototype._request = function (config, callback) {
    var abort = false;
    var req = new EventEmitter();
    var res = new EventEmitter();
    var client = this.createClient(config);

    callback && callback(res);
    if (config.pack !== 'redis' && config.unpack !== 'redis') {
        req.emit('error', new Error('redis protocol only support redis converter'));
    }
    var onData = function (err, result) {
        if (abort) {
            return;
        }
        if (err) {
            res.emit('error', err);
            return;
        }
        res.emit('data', result);
        res.emit('end', result);
    };
    var args = config.payload.concat([onData]);
    client[config.method].apply(client, args); 
    req.abort = function () {
        abort = true;
    };
    return req;
};

module.exports = RedisProtocol;
