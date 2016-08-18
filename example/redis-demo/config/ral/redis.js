/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2016/8/18
 */

'use strict';

module.exports.REDIS = {
    protocol: 'redis',
    pack: 'redis',
    unpack: 'redis',
    balance: 'random',
    timeout: 100,
    server: [{
        host: '10.50.82.55',
        port: 3003
    }]
};
