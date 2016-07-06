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
    unpack: 'stream',
    method: 'POST',
    balance: 'roundrobin',
    timeout: 5000,
    retry: 0,
    encoding: 'utf-8',
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
    encoding: 'gbk', // wenku.baidu.com编码为GBK
    timeout: 5000,
    retry: 0,
    path: '/',
    server: [{
        host: '127.0.0.1',
        port: 9032
    }]
};
