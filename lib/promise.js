/**
 * @file mock
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2016/03/21
 *
 * 提供Promise接口
 */

'use strict';

var ral = require('./ral.js');
var RalPromise = function (name, options) {
    if (!global.Promise) {
        throw new Error('Node.js version is too low to support promise');
    }
    return new Promise(function (resolve, reject) {
        ral(name, options).on('data', resolve).on('error', reject);
    });
};

RalPromise.init = ral.init.bind(ral);
RalPromise.getRawConf = ral.getRawConf.bind(ral);
RalPromise.getConf = ral.getConf.bind(ral);
RalPromise.setConfigNormalizer = ral.setConfigNormalizer.bind(ral);
RalPromise.appendExtPath = ral.appendExtPath.bind(ral);

module.exports = RalPromise;
