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
    }
};
