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

module.exports = function (name, options) {
    if (!global.Promise) {
        throw new Error('Node.js version is too low to support promise');
    }
    return new Promise(function (resolve, reject) {
        ral(name, options).on('data', resolve).on('error', reject);
    });
};
