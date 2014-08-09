/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/8
 */

'use strict';

module.exports = {
    'GET_QS_SERV': {
        unpack: 'json',
        pack: 'querystring',
        method: 'GET',
        encoding: 'utf-8',
        balance: 'random',
        protocol: 'http',
        query: 'from=ral',
        server: [
            { host: '127.0.0.1', port: 8192, idc: 'tc'},
            { host: '127.0.0.1', port: 8193, idc: 'tc'},
            { host: '127.0.0.1', port: 8194, idc: 'st'}
        ]
    }
};