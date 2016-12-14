/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/8
 */

'use strict';

module.exports = {
    GET_QS_SERV: {
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
    },
    CHANGE_PACK_UNPACK: {
        unpack: 'stream',
        pack: 'stream',
        method: 'GET',
        encoding: 'utf-8',
        balance: 'random',
        protocol: 'http',
        query: 'from=change',
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
    },
    TEST_QUERY_SERV: {
        unpack: 'json',
        pack: 'querystring',
        method: 'GET',
        encoding: 'utf-8',
        balance: 'random',
        protocol: 'http',
        server: [{
            host: '127.0.0.1',
            port: 8193,
            idc: 'tc'
        }]
    },
    POST_QS_SERV: {
        enableMock: true,
        unpack: 'json',
        pack: 'form',
        method: 'POST',
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
    },
    INVALID_SERVICE: {
        unpack: 'json',
        pack: 'querystring',
        method: 'GET',
        encoding: 'utf-8',
        balance: 'random',
        protocol: 'http',
        query: 'from=ral'
    },
};
