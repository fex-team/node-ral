/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/4
 */

'use strict';

var _ = require('underscore');
var util = require('./util.js');
var expect = require('chai').expect;
var iconv = require('iconv-lite');
var fs = require('fs');
var path = require('path');
var logger = require('./logger.js')('Config');
var RalModule = require('./ralmodule.js');

var defaultServiceInfo = {
    retry: 0,
    timeout: 3000,
    encoding: 'utf8',
    hybird: false,
    pack: 'string',
    unpack: 'string',
    path: '/'
};

/**
 * global config
 * @type {{}}
 */
var config = {};
var contextCache = {};

function parse(config) {

    /**
     * normalize config and inherit default config
     * @param serviceInfo
     * @returns {*}
     */
    function normalize(serviceInfo) {
        serviceInfo.encoding = serviceInfo.encoding && serviceInfo.encoding.toString().toLowerCase();
        //inherit default config
        _.map(defaultServiceInfo, function(value, key){
            if (serviceInfo.hasOwnProperty(key) === false){
                serviceInfo[key] = value;
            }
        });
        serviceInfo.timeout = Math.ceil(serviceInfo.timeout);
    }

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

    _.map(config, function (serviceInfo, serviceID) {
        normalize(serviceInfo);
        serviceInfo.serviceID = serviceID;
        validate(serviceID, serviceInfo);
    });
    return config;
}

function parseContext(serviceID){
    var serviceInfo =  config[serviceID];
    var context = {};
    context.unpack = RalModule.modules.converter[serviceInfo.unpack].unpack;
    context.pack = RalModule.modules.converter[serviceInfo.pack].pack;
    context.protocol = RalModule.modules.protocol[serviceInfo.protocol];
    context.balance =  RalModule.modules.balance[serviceInfo.balance];
    var contextClass = context.balance.getContextClass();
    context.balanceContext = new contextClass(serviceID, serviceInfo);
    context.protocolContext = context.protocol.normalizeConfig(serviceInfo);
    contextCache[serviceID] = context;
}

function _load(confPath) {

    function _loadByFile(confPath){
        //load js or json as config
        var ext = path.extname(confPath);
        if (ext === '.js') {
            logger.trace('load config from ' +confPath);
            _.extend(config, require(confPath));
        } else if (ext === '.json') {
            logger.trace('load config from ' +confPath);
            var content = fs.readFileSync(confPath);
            _.extend(config, JSON.parse(content.toString()));
        }
    }

    function _loadByFolder(confPath){
        var files = util.readdirSync(confPath);
        files.map(_loadByFile);
    }

    var stats = fs.statSync(confPath);
    if (stats.isFile()) {
        _loadByFile(confPath);
    } else if (stats.isDirectory()) {
        _loadByFolder(confPath);
    }
}

function load(confPath){
    confPath = path.normalize(confPath);
    try{
        _load(confPath);
        config = parse(config);
    }catch(err){
        logger.fatal('config [' + confPath + '] load failed');
        throw err;
    }
    return config;
}

module.exports.parse = parse;
module.exports.load = load;

module.exports.getConf = function(name){
    //return a copy
    if (config[name]){
        var conf =  util.merge({}, config[name]);
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