/**
 * @file ral module base class
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/5
 */

'use strict';

// var util = require('util');
var _ = require('underscore');
var logger = require('./logger.js')('RalModule');
var ralUtil = require('./util.js');
var path = require('path');

function RalModule() {}

RalModule.modules = {};

RalModule.clearCache = function () {
    RalModule.modules = {};
}

/**
 * get module name
 */
RalModule.prototype.getName = function () {
    throw new Error('Not Implemented');
};

/**
 * get module category
 */
RalModule.prototype.getCategory = function () {
    throw new Error('Not Implemented');
};

/**
 * load modules from path
 *
 * @param  {string} pathOrModule [description]
 */
RalModule.load = function (pathOrModule) {

    function loadFile(filePath) {
        var ext = path.extname(filePath);
        if (ext === '.js') {
            // logger.trace('load module from ' + filePath);
            var ModuleClass = require(filePath);
            if (ModuleClass && typeof ModuleClass === 'function') {
                loadModule(new ModuleClass());
            }
        }
    }

    function loadModule(module) {
        var catagory;
        var name;
        try {
            catagory = module.getCategory();
            name = module.getName();
        }
        catch (e) {
            return;
        }
        RalModule.modules[catagory] = RalModule.modules[catagory] || {};
        if (RalModule.modules[catagory][name]) {
            logger.warning('module ' + name + ' override');
        }
        RalModule.modules[catagory][name] = module;
    }

    if (_.isString(pathOrModule)) {
        var files = ralUtil.readdirSync(pathOrModule);
        files.map(loadFile);
    }
    else if (pathOrModule.getCategory && pathOrModule.getName) {
        loadModule(pathOrModule);
    }
};

module.exports = RalModule;
