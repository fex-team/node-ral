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
        host: '127.0.0.1',
        port: 6379
    }]
};
