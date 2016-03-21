/**
 * @file node-ral middleware
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/9/4
 */

'use strict';

var ral = require('./ral.js');
var ralP = require('./promise.js');

module.exports = function (options) {

    ral.init(options);

    return function (req, res, next) {
        req.RAL = ral;
        req.RALPromise = ralP;
        next();
    };
};
