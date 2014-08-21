/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/5
 */

'use strict';

var util = require('util');
var _ = require('underscore');
var logger = require('./logger.js')('RalModule');
var ralUtil = require('./util.js');
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

RalModule.load = function(pathOrModule){

    function loadFile(filePath){
        var ext = path.extname(filePath);
        if (ext === '.js') {
            logger.trace('load module from ' +filePath);
            var moduleClass = require(filePath);
            loadModule(new moduleClass());
        }
    }

    function loadModule(module){
        var catagory, name;
        try {
            catagory = module.getCategory();
            name = module.getName();
        }catch(e){
            logger.warning('[' + pathOrModule + '] is skiped since not RalModule');
            return;
        }
        RalModule.modules[catagory] = RalModule.modules[catagory] || {};
        if (RalModule.modules[catagory][name]){
            logger.warning('module ' + name + ' override');
        }
        RalModule.modules[catagory][name] = module;
    }

    if (_.isString(pathOrModule)){
        var files = ralUtil.readdirSync(pathOrModule);
        files.map(loadFile);
    }else if (pathOrModule.getCategory && pathOrModule.getName){
        loadModule(pathOrModule);
    }else{
        logger.trace('[' + pathOrModule + '] is skiped since not RalModule');
    }
};

module.exports = RalModule;