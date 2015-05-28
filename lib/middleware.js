/**
 * @file node-ral middleware
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/9/4
 */

'use strict';

var RAL = require('./ral.js');

module.exports = function (options) {

    RAL.init(options);

    return function (req, res, next) {
        req.RAL = RAL;
        next();
    };
};
