/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/4
 */

'use strict';

module.exports.IDC_ALL = 'all';
module.exports.currentIDC = module.exports.IDC_ALL; // default config update time is 60s
module.exports.updateInterval = 60000;
module.exports.env = process.env.RAL_ENV || process.env.YOG_ENV;
