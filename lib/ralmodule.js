/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/5
 */

'use strict';

var util = require('util');
var _ = require('underscore');
var logger = require('./logger.js')('RalModule');
var recursive = require('recursive-readdir');
var async = require('async');
var path = require('path');

function RalModule(){
}

RalModule.modules = {};

/**
 * get module name
 */
RalModule.prototype.getName = function(){
    throw new Error('Not Implemented');
};

RalModule.prototype.getCategory = function(){
    throw new Error('Not Implemented');
};

RalModule.load = function(pathOrModule, callback){
    var catagory, name;

    function loadFile(filePath){
        var ext = path.extname(filePath);
        if (ext === '.js') {
            logger.trace('load module from ' +filePath);
            var moduleClass = require(filePath);
            loadModule(new moduleClass());
        }
    }

    function loadModule(module){
        try {
            catagory = module.getCategory();
            name = module.getName();
        }catch(e){
            return;
        }
        RalModule.modules[catagory] = RalModule.modules[catagory] || {};
        if (RalModule.modules[catagory][name]){
            logger.warning('module ' + name + ' override');
        }
        RalModule.modules[catagory][name] = module;
    }

    if (_.isString(pathOrModule)){
        recursive(pathOrModule, function (err, files) {
            if (err){
                logger.fatal('ext folder [' + pathOrModule + '] recursive failed');
                callback && callback(err);
                return;
            }
            files.map(loadFile);
            callback && callback(null);
        });
    }else if (pathOrModule.getCategory && pathOrModule.getName){
        loadModule(pathOrModule);
        callback && callback(null);
    }else{
        logger.trace('[' + pathOrModule + '] is skiped since not RalModule');
        callback && callback(null);
    }
};

module.exports = RalModule;