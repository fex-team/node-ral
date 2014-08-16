/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/16
 */

'use strict';

module.exports = {
    'SIMPLE_GET': {
        unpack: 'raw',
        pack: 'raw',
        method: 'GET',
        encoding: 'utf-8',
        balance: 'random',
        protocol: 'http',
        server: [
            { host: '127.0.0.1', port: 8192}
        ]
    }
};