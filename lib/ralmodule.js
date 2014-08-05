/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/5
 */

'use strict';

function RalModule(){

}

/**
 * get module name
 */
RalModule.prototype.getName = function(){
    throw new Error('Not Implemented');
};

/**
 * get module context class
 */
RalModule.prototype.getContext = function(){
    throw new Error('Not Implemented');
};

module.exports = RalModule;