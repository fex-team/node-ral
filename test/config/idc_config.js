/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/4
 */

'use strict';

module.exports = {
    bookService: {
        unpack: 'json',
        pack: 'json',
        // 指定服务端交互的编码格式，由于Node.js环境只支持UTF-8，因此yog-ral会自动进行转码工作
        encoding: 'GBK',
        balance: 'random',
        protocol: 'http',
        server: [{
            host: 'st.yd.baidu.com',
            port: 80,
            idc: 'st'
        }, {
            host: 'tc.yd.baidu.com',
            port: 80,
            idc: 'tc'
        }]
    },
    bookService2: {
        unpack: 'json',
        pack: 'json',
        // 指定服务端交互的编码格式，由于Node.js环境只支持UTF-8，因此yog-ral会自动进行转码工作
        encoding: 'GBK',
        balance: 'random',
        protocol: 'http',
        server: [{
            host: 'st.yd.baidu.com',
            port: 80
        }, {
            host: 'tc.yd.baidu.com',
            port: 80,
            idc: 'tc'
        }]
    },
    bookService3: {
        unpack: 'json',
        pack: 'json',
        // 指定服务端交互的编码格式，由于Node.js环境只支持UTF-8，因此yog-ral会自动进行转码工作
        encoding: 'GBK',
        balance: 'random',
        protocol: 'http',
        // 开启混联，无视idc
        hybird: true,
        server: [{
            host: 'st.yd.baidu.com',
            port: 80,
            idc: 'st'
        }, {
            host: 'tc.yd.baidu.com',
            port: 80,
            idc: 'tc'
        }]
    },
    bookService4: {
        unpack: 'json',
        pack: 'json',
        // 指定服务端交互的编码格式，由于Node.js环境只支持UTF-8，因此yog-ral会自动进行转码工作
        encoding: 'GBK',
        balance: 'random',
        protocol: 'http',
        // 开启混联，无视idc
        hybird: true,
        server: [{
            host: '127.0.0.1',
            port: 80,
            index: '0'
        }, {
            host: '127.0.0.2',
            port: 80,
            index: '1'
        }, {
            host: '127.0.0.3',
            port: 80,
            index: '2'
        }, {
            host: '127.0.0.4',
            port: 80,
            index: '3'
        }, {
            host: '127.0.0.5',
            port: 80,
            index: '4'
        }, {
            host: '127.0.0.6',
            port: 80,
            index: '5'
        }, {
            host: '127.0.0.7',
            port: 80,
            index: '6'
        }, {
            host: '127.0.0.8',
            port: 80,
            index: '7'
        }, {
            host: '127.0.0.9',
            port: 80,
            index: '8'
        }, {
            host: '127.0.0.10',
            port: 80,
            index: '9'
        }]
    }
};
