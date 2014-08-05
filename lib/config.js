/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/4
 */

'use strict';

var _ = require('underscore');
var expect = require('chai').expect;
var iconv = require('iconv-lite');
var fs = require('fs');
var async = require('async');
var recursive = require('recursive-readdir');
var path = require('path');
var logger = require('./logger.js')('Config');

var defaultServiceInfo = {
    retry: 0,
    timeout: 3000,
    encoding: 'utf8',
    hybird: false,
    pack: 'string',
    unpack: 'string'
};

/**
 * global config
 * @type {{}}
 */
var config = {};

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
        should(serviceInfo, 'timeout').to.be.a('number').at.least(100);
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
        validate(serviceID, serviceInfo);
    });
    return config;
}

function _load(confPath, callback) {

    function _loadByFile(confPath, callback){
        //load js or json as config
        var ext = path.extname(confPath);
        if (ext === '.js') {
            logger.trace('load config from ' +confPath);
            _.extend(config, require(confPath));
            callback && callback(null);
        } else if (ext === '.json') {
            logger.trace('load config from ' +confPath);
            fs.readFile(confPath, function (err, content) {
                if (err){
                    logger.fatal('config file [' + confPath + '] read failed ');
                    callback && callback(err);
                    return;
                }
                _.extend(config, JSON.parse(content.toString()));
                callback && callback(null);
            });
        }else{
            callback && callback(null, config);
        }
    }

    function _loadByFolder(confPath, callback){
        //recursively get files in folder
        recursive(confPath, function (err, files) {
            if (err){
                logger.fatal('config folder [' + confPath + '] recursive failed');
                callback && callback(err);
                return;
            }
            //load config
            async.map(files, _loadByFile, function(err){
                if (err){
                    callback && callback(err);
                    return;
                }
                callback && callback(null);
            });
        });
    }

    fs.stat(confPath, function (err, stats) {
        if (err){
            logger.fatal('config path [' + confPath + '] stat failed ');
            callback && callback(err);
            return;
        }
        if (stats.isFile()) {
            _loadByFile(confPath, callback);
        } else if (stats.isDirectory()) {
            _loadByFolder(confPath, callback);
        }
    });
}

function load(confPath, callback){
    confPath = path.normalize(confPath);
    _load(confPath, function(err){
        if (err){
            logger.fatal('config [' + confPath + '] load failed');
            callback && callback(err);
            return;
        }
        try{
            config = parse(config);
        }catch(e){
            logger.fatal('config [' + confPath + '] parse error');
            throw e;
        }
        callback && callback(null, config);
    });
}

module.exports.parse = parse;
module.exports.load = load;
module.exports.getConf = function(){
    return config;
};