/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2015/5/10
 */

'use strict';

module.exports.PROXY = {
    protocol: 'http',
    pack: 'stream',
    unpack: 'string',
    method: 'POST',
    balance: 'roundrobin',
    timeout: 5000,
    retry: 0,
    encoding: 'gbk', // wenku.baidu.com编码为GBK
    path: '/',
    server: [{
        host: 'wenku.baidu.com',
        port: 80
    }]
};

module.exports.DEMO_SERVER = {
    protocol: 'http',
    pack: 'form',
    unpack: 'string',
    method: 'POST',
    balance: 'roundrobin',
    encoding: 'utf-8', // 由于DEMO SERVER的返回值是经过转码的，因此直接使用UTF-8
    timeout: 5000,
    retry: 0,
    path: '/',
    server: [{
        host: '127.0.0.1',
        port: 9032
    }]
};
