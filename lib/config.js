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

/**
 * global config
 * @type {{}}
 */
var config = {};
var rawConf = {};
var contextCache = {};
var normalizerManager = new NormalizerManager();


function parse(rawConf) {

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
            return ['[', serviceID, '] config error => ', '[', property , ']'].join('');
        }

        function should(object, property) {
            return expect(object[property], info(property));
        }

        should(serviceInfo, 'retry').to.be.a('number').at.least(0);
        should(serviceInfo, 'timeout').to.be.a('number').at.least(1);
        should(serviceInfo, 'encoding').to.be.a('string');
        expect(iconv.encodingExists(serviceInfo.encoding), info('encoding is valid')).to.be.true;
        //TODO use registered converter to check
        should(serviceInfo, 'pack').to.be.a('string');
        should(serviceInfo, 'unpack').to.be.a('string');
        //TODO use registered balance to check
        should(serviceInfo, 'balance').to.be.a('string');
        //TODO use registered protocol to check
        should(serviceInfo, 'protocol').to.be.a('string');
        should(serviceInfo, 'hybird').to.be.a('boolean');
        should(serviceInfo, 'server').to.be.a('array').and.not.to.be.empty;

        serviceInfo.server.forEach(function (serverInfo) {
            should(serverInfo, 'host').to.be.a('string');
            should(serverInfo, 'port').to.be.a('number').at.least(0);
            serverInfo.idc && should(serverInfo, 'idc').to.be.a('string');
        });
    }

    var clone = ralUtil.merge({}, rawConf);
    _.map(clone, function (serviceInfo, serviceID) {
        //normalize
        normalizerManager.apply(serviceInfo);
        validate(serviceID, serviceInfo);
    });
    return clone;
}

function _load(confPath) {
    var confFromFile = {};

    function _loadByFile(confPath){
        //load js or json as config
        var ext = path.extname(confPath);
        if (ext === '.js') {
            logger.trace('load config from ' +confPath);
            _.extend(confFromFile, require(confPath));
        } else if (ext === '.json') {
            logger.trace('load config from ' +confPath);
            var content = fs.readFileSync(confPath);
            _.extend(confFromFile, JSON.parse(content.toString()));
        }
    }

    function _loadByFolder(confPath){
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

function load(confPath){
    confPath = path.normalize(confPath);
    try{
        //load raw conf
        rawConf = _load(confPath);
        _.map(rawConf, function(serviceID, rawInfo){
            rawInfo.serviceID = serviceID;
        });
        //parse conf to normalized config
        config = parse(rawConf);
    }catch(err){
        logger.fatal('config [' + confPath + '] load failed');
        throw err;
    }
    return config;
}

function parseContext(serviceID){
    var serviceInfo =  config[serviceID];
    var context = {};
    context.unpack = RalModule.modules.converter[serviceInfo.unpack].unpack;
    context.pack = RalModule.modules.converter[serviceInfo.pack].pack;
    context.unpackConverter = RalModule.modules.converter[serviceInfo.unpack];
    context.packConverter = RalModule.modules.converter[serviceInfo.pack];
    context.protocol = RalModule.modules.protocol[serviceInfo.protocol];
    context.balance =  RalModule.modules.balance[serviceInfo.balance];
    var contextClass = context.balance.getContextClass();
    context.balanceContext = new contextClass(serviceID, serviceInfo);
    context.protocolContext = context.protocol.normalizeConfig(serviceInfo);
    contextCache[serviceID] = context;
}


module.exports.parse = parse;
module.exports.load = load;

module.exports.getConf = function(name){
    //return a copy
    if (config[name]){
        var conf =  ralUtil.merge({}, config[name]);
        conf.__defineGetter__('context', function(){
            if (!contextCache[name]){
                parseContext(name, config[name]);
            }
            return contextCache[name];
        });
        return conf;
    }
};

module.exports.getConfObject = function(name){
    return config[name];
};

module.exports.getConfNames = function(){
    return Object.keys(config);
};