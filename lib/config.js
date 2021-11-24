/**
 * @file node-ral
 * @author hefangshi@baidu.com
 *
 * http://fis.baidu.com/
 * 2014/8/4
 */

'use strict';

var _ = require('underscore');
var ralUtil = require('./util.js');
var cexpect = require('chai').expect;
var iconv = require('iconv-lite');
var fs = require('fs');
var path = require('path');
var logger = require('./logger.js')('Config');
var RalModule = require('./ralmodule.js');
var NormalizerManager = require('./config/normalizerManager.js');
var configUpdater = require('./config/configUpdater.js');
var ctx = require('./ctx.js');

/**
 * global config
 *
 * @type {Object}
 */
var config = {};
var rawConf = {};
var updateNeededRawConf = {};
var contextCache = {};
var normalizerManager = new NormalizerManager();
var updateInterval = null;

/**
 * regularly update config with config nomalizer
 *
 * @param  {number}   interval [description]
 * @param  {boolean}   all      [description]
 * @param  {Function} cb       [description]
 */
var enableUpdate = function (interval, all, cb) {
    interval = interval || ctx.updateInterval;
    if (updateInterval) {
        clearInterval(updateInterval);
    }

    function start() {
        updateInterval = setInterval(function () {
            configUpdater.update(function (err, confs) {
                cb && cb(err, confs);
                if (!err) {
                    _.map(confs, function (conf, serviceID) {
                        validate(serviceID, conf);
                        if (conf._isValid === true) {
                            config[serviceID] = conf;
                            contextCache[serviceID] = {};
                        }
                    });
                    logger.notice('confg update succ');
                }
                else {
                    logger.warning('config update failed: ' + err.stack);
                }
            }, all);
        }, interval);
    }

    // 对齐至每分钟开始时启动更新，使多个cluster之间保持大致同步

    var padding = 59 - (new Date()).getSeconds();
    setTimeout(function () {
        start();
    }, padding * 1000);
};

var disableUpdate = function () {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
};

var isAutoUpdateEnabled = function () {
    return !!updateInterval;
};

/**
 * validate
 *
 * @param  {string} serviceID   [description]
 * @param  {Object} serviceInfo [description]
 */
function validate(serviceID, serviceInfo) {
    function info(property) {
        return ['[', serviceID, '] config error => ', '[', property, ']'].join('');
    }

    function should(object, property) {
        return cexpect(object[property], info(property));
    }
    try {
        should(serviceInfo, 'portOffset').to.be.a('number');
        should(serviceInfo, 'retry').to.be.a('number').at.least(0);
        should(serviceInfo, 'timeout').to.be.a('number').at.least(1);
        should(serviceInfo, 'encoding').to.be.a('string');
        cexpect(iconv.encodingExists(serviceInfo.encoding), info('encoding is invalid')).to.be.true;
        should(serviceInfo, 'pack').to.be.a('string');
        cexpect(RalModule.modules.converter, 'invalid pack').to.have.property(serviceInfo.pack);
        should(serviceInfo, 'unpack').to.be.a('string');
        cexpect(RalModule.modules.converter, 'invalid unpack').to.have.property(serviceInfo.unpack);
        should(serviceInfo, 'balance').to.be.a('string');
        cexpect(RalModule.modules.balance, 'invalid balance').to.have.property(serviceInfo.balance);
        should(serviceInfo, 'protocol').to.be.a('string');
        cexpect(RalModule.modules.protocol, 'invalid protocol').to.have.property(serviceInfo.protocol);
        should(serviceInfo, 'hybird').to.be.a('boolean');
        should(serviceInfo, 'server').to.be.a('array').and.not.to.be.empty;

        serviceInfo.server.forEach(function (serverInfo) {
            should(serverInfo, 'host').to.be.a('string');
            should(serverInfo, 'port').to.be.a('number').at.least(0);
            serverInfo.idc && should(serverInfo, 'idc').to.be.a('string');
        });

        serviceInfo._isValid = true;
        serviceInfo._validateFailInfo = null;
    }catch (e) {
        logger.fatal('config ' + serviceID + ' loaded failed since ' + e.message);
        serviceInfo._isValid = false;
        serviceInfo._validateFailInfo = e.message;
    }
}

/**
 * load rawConf to valid conf
 *
 * @param  {Object} inputRawConf [description]
 * @return {Object}              [description]
 */
function loadRawConf(inputRawConf) {
    var clone = ralUtil.deepClone(inputRawConf);
    updateNeededRawConf = {};
    var needUpdate = false;
    _.map(clone, function (serviceInfo, serviceID) {
        if (normalizerManager.needUpdate(serviceInfo)) {
            updateNeededRawConf[serviceID] = inputRawConf[serviceID];
            needUpdate = true;
        }
        // normalize
        clone[serviceID] = serviceInfo = normalizerManager.apply(serviceInfo);
        validate(serviceID, serviceInfo);
    });
    if (needUpdate) {
        logger.notice('config auto update was started');
        enableUpdate();
    }
    config = clone;
    return clone;
}

/**
 * load config by config folder
 *
 * @param  {string} confPath [description]
 * @return {Object}          [description]
 */
function load(confPath) {
    function loadConfByPath(normalizedPath) {
        var confFromFile = {};

        function loadFile(filePath) {
            // load js or json as config
            var ext = path.extname(filePath);
            var name = path.basename(filePath, ext);
            var data;
            if (ext === '.js') {
                logger.trace('load config from ' + filePath);
                data = require(filePath);
                if (data) {
                    data = ralUtil.deepClone(data);
                }
            }
            else if (ext === '.json') {
                logger.trace('load config from ' + filePath);
                var content = fs.readFileSync(filePath);
                data = JSON.parse(content.toString());
            }
            if (name === 'idc') {
                ctx.currentIDC = data.idc.toString();
            }
            else {
                _.extend(confFromFile, data);
            }
        }

        function loadFolder(folderPath) {
            var files = ralUtil.readdirWithEnvSync(folderPath, ctx.env);
            files.map(loadFile);
        }

        if (fs.existsSync(normalizedPath)) {
            var stats = fs.statSync(normalizedPath);
            if (stats.isFile()) {
                loadFile(normalizedPath);
            }
            else if (stats.isDirectory()) {
                loadFolder(normalizedPath);
            }
        }
        return confFromFile;
    }

    confPath = path.normalize(confPath);
    try {
        // load raw conf
        rawConf = loadConfByPath(confPath);
        _.map(rawConf, function (value, key) {
            value.serviceID = key;
            contextCache[key] = {};
        });
        // parse conf to normalized config
        loadRawConf(rawConf);
    }
    catch (err) {
        logger.fatal('config [' + confPath + '] load failed');
        throw err;
    }
    return config;
}

/**
 * get runtime config context
 *
 * @param  {string} serviceID [description]
 * @param  {Object} options   [description]
 * @return {Object}           [description]
 */
function parseContext(serviceID, options) {
    var serviceInfo = config[serviceID];
    var context = {};
    context.protocol = RalModule.modules.protocol[serviceInfo.protocol];
    context.balance = RalModule.modules.balance[serviceInfo.balance];
    var ContextClass = context.balance.getContextClass();
    // 确保缓存被初始化
    if (!contextCache[serviceID]) {
        contextCache[serviceID] = {};
    }
    // 从缓存中获取BalanceContext避免重复创建
    if (!contextCache[serviceID].balance) {
        contextCache[serviceID].balance = new ContextClass(serviceID, serviceInfo);
    }
    context.balanceContext = contextCache[serviceID].balance;
    // // 从缓存中获取ProtocolContext避免重复创建
    // if (!contextCache[serviceID].protocol) {
    //     contextCache[serviceID].protocol = context.protocol.normalizeConfig(serviceInfo);
    // }
    // context.protocolContext = contextCache[serviceID].protocol;
    context.packConverter = RalModule.modules.converter[options.pack || serviceInfo.pack];
    context.pack = context.packConverter.pack.bind(context.packConverter);
    context.unpackConverter = RalModule.modules.converter[options.unpack || serviceInfo.unpack];
    context.unpack = context.unpackConverter.unpack.bind(context.unpackConverter);
    return context;
}


module.exports.loadRawConf = loadRawConf;
module.exports.load = load;
module.exports.normalizerManager = normalizerManager;
module.exports.normalize = normalizerManager.apply.bind(normalizerManager);

module.exports.getContext = parseContext;

module.exports.getConf = function (name) {
    // return a copy
    if (config[name]) {
        var conf = ralUtil.deepClone(config[name]);
        return conf;
    }
};

module.exports.clearConf = function () {
    config = {};
    rawConf = {};
    updateNeededRawConf = {};
    contextCache = {};
    disableUpdate();
};

/**
 * get all service keys
 *
 * @return {Array} service keys
 */
module.exports.getConfNames = function () {
    return Object.keys(config);
};

/**
 * get raw conf
 *
 * @return {Object} raw conf
 */
module.exports.getRawConf = function () {
    return ralUtil.deepClone(rawConf);
};

module.exports.getUpdateNeededRawConf = function () {
    return ralUtil.deepClone(updateNeededRawConf);
};

module.exports.enableUpdate = enableUpdate;
module.exports.disableUpdate = disableUpdate;
module.exports.isAutoUpdateEnabled = isAutoUpdateEnabled;
