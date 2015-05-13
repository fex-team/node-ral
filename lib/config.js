/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/4
 */

'use strict';

var _ = require('underscore');
var ralUtil = require('./util.js');
var util = require('util');
var expect = require('chai').expect;
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
 * @type {{}}
 */
var config = {};
var rawConf = {};
var updateNeededRawConf = {};
var contextCache = {};
var normalizerManager = new NormalizerManager();
var updateInterval = null;

/**
 * regularly update config with config nomalizer
 * @param interval
 * @param all
 * @param cb
 */
var enableUpdate = function (interval, all, cb) {
    interval = interval || ctx.updateInterval;
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    updateInterval = setInterval(function () {
        configUpdater.update(function (err, confs) {
            cb && cb(err, confs);
            if (!err) {
                _.map(confs, function (conf) {
                    config[conf.serviceID] = conf;
                    contextCache[conf.serviceID] = {};
                });
            } else {
                logger.warning('config update failed: ' + err.message);
            }
        }, all);
    }, interval);
};

var disableUpdate = function () {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
};

var isAutoUpdateEnabled = function () {
    return updateInterval ? true : false;
};

/**
 * parse rawConf to valid conf
 * @param rawConf
 * @returns {*}
 */
function loadRawConf(rawConf) {
    /**
     * validate
     * @param serviceID
     * @param serviceInfo
     */
    function validate(serviceID, serviceInfo) {
        /**
         * generate a handy error info
         * @param property
         * @returns {string}
         */
        function info(property) {
            return ['[', serviceID, '] config error => ', '[', property, ']'].join('');
        }

        function should(object, property) {
            return expect(object[property], info(property));
        }

        should(serviceInfo, 'retry').to.be.a('number').at.least(0);
        should(serviceInfo, 'timeout').to.be.a('number').at.least(1);
        should(serviceInfo, 'encoding').to.be.a('string');
        expect(iconv.encodingExists(serviceInfo.encoding), info('encoding is valid')).to.be.true;
        should(serviceInfo, 'pack').to.be.a('string');
        expect(RalModule.modules.converter, 'invalid pack').to.have.property(serviceInfo.pack);
        should(serviceInfo, 'unpack').to.be.a('string');
        expect(RalModule.modules.converter, 'invalid unpack').to.have.property(serviceInfo.unpack);
        should(serviceInfo, 'balance').to.be.a('string');
        expect(RalModule.modules.balance, 'invalid balance').to.have.property(serviceInfo.balance);
        should(serviceInfo, 'protocol').to.be.a('string');
        expect(RalModule.modules.protocol, 'invalid protocol').to.have.property(serviceInfo.protocol);
        should(serviceInfo, 'hybird').to.be.a('boolean');
        should(serviceInfo, 'server').to.be.a('array').and.not.to.be.empty;

        serviceInfo.server.forEach(function (serverInfo) {
            should(serverInfo, 'host').to.be.a('string');
            should(serverInfo, 'port').to.be.a('number').at.least(0);
            serverInfo.idc && should(serverInfo, 'idc').to.be.a('string');
        });
    }

    var clone = ralUtil.deepClone(rawConf);
    updateNeededRawConf = {};
    var needUpdate = false;
    _.map(clone, function (serviceInfo, serviceID) {
        if (normalizerManager.needUpdate(serviceInfo)) {
            updateNeededRawConf[serviceID] = rawConf[serviceID];
            needUpdate = true;
        }
        //normalize
        clone[serviceID] = serviceInfo = normalizerManager.apply(serviceInfo);
        validate(serviceID, serviceInfo);
    });
    if (needUpdate) {
        logger.notice('config auto update was started');
        enableUpdate();
    } else {
        logger.notice('config auto update wase disabled');
    }
    config = clone;
    return clone;
}

/**
 * load config by config folder
 * @param confPath
 * @returns {{}}
 */
function load(confPath) {
    function _load(confPath) {
        var confFromFile = {};

        function _loadByFile(confPath) {
            //load js or json as config
            var ext = path.extname(confPath);
            var name = path.basename(confPath, ext);
            var data;
            if (ext === '.js') {
                logger.trace('load config from ' + confPath);
                data = require(confPath);
            } else if (ext === '.json') {
                logger.trace('load config from ' + confPath);
                var content = fs.readFileSync(confPath);
                data = JSON.parse(content.toString());
            }
            if (name === 'idc') {
                ctx.currentIDC = data.idc.toString();
            } else {
                _.extend(confFromFile, data);
            }
        }

        function _loadByFolder(confPath) {
            var files = ralUtil.readdirSync(confPath);
            files.map(_loadByFile);
        }

        var stats = fs.statSync(confPath);
        if (stats.isFile()) {
            _loadByFile(confPath);
        } else if (stats.isDirectory()) {
            _loadByFolder(confPath);
        }
        return confFromFile;
    }

    confPath = path.normalize(confPath);
    try {
        //load raw conf
        rawConf = _load(confPath);
        _.map(rawConf, function (value, key) {
            value.serviceID = key;
        });
        //parse conf to normalized config
        loadRawConf(rawConf);
    } catch (err) {
        logger.fatal('config [' + confPath + '] load failed');
        throw err;
    }
    return config;
}

/**
 * get runtime config context
 * @param serviceID
 */
function parseContext(serviceID, options) {
    var serviceInfo = config[serviceID];
    var context = {};
    context.protocol = RalModule.modules.protocol[serviceInfo.protocol];
    context.balance = RalModule.modules.balance[serviceInfo.balance];
    var contextClass = context.balance.getContextClass();
    context.balanceContext = new contextClass(serviceID, serviceInfo);
    context.protocolContext = context.protocol.normalizeConfig(serviceInfo);
    context.packConverter = RalModule.modules.converter[options.pack || serviceInfo.pack];
    context.pack = context.packConverter.pack;
    context.unpackConverter = RalModule.modules.converter[options.unpack || serviceInfo.unpack];
    context.unpack = context.unpackConverter.unpack;
    return context;
}


module.exports.loadRawConf = loadRawConf;
module.exports.load = load;
module.exports.normalizerManager = normalizerManager;
module.exports.normalize = normalizerManager.apply.bind(normalizerManager);

module.exports.getContext = parseContext;

module.exports.getConf = function (name) {
    //return a copy
    if (config[name]) {
        var conf = ralUtil.deepClone(config[name]);
        return conf;
    }
};

module.exports.getConfNames = function () {
    return Object.keys(config);
};

module.exports.getRawConf = function () {
    return ralUtil.deepClone(rawConf);
};

module.exports.getUpdateNeededRawConf = function () {
    return ralUtil.deepClone(updateNeededRawConf);
};

module.exports.enableUpdate = enableUpdate;
module.exports.disableUpdate = disableUpdate;
module.exports.isAutoUpdateEnabled = isAutoUpdateEnabled;