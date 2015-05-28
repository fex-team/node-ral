/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/9/4
 */

'use strict';

module.exports = {
    FROM_MIDDLEWARE: {
        unpack: 'json',
        pack: 'querystring',
        method: 'GET',
        encoding: 'utf-8',
        balance: 'random',
        protocol: 'http',
        query: 'from=ral',
        server: [{
            host: '127.0.0.1',
            port: 8192,
            idc: 'tc'
        }, {
            host: '127.0.0.1',
            port: 8193,
            idc: 'tc'
        }, {
            host: '127.0.0.1',
            port: 8194,
            idc: 'st'
        }]
    }
};
