/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/4
 */

'use strict';

module.exports = {
    withPortOffset: {
        unpack: 'json',
        pack: 'json',
        // 指定服务端交互的编码格式，由于Node.js环境只支持UTF-8，因此yog-ral会自动进行转码工作
        encoding: 'GBK',
        balance: 'random',
        protocol: 'http',
        portOffset: 10,
        server: [{
            host: 'st.yd.baidu.com',
            idc: 'st'
        }, {
            host: 'tc.yd.baidu.com',
            port: 70,
            idc: 'tc'
        }]
    },
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
    bookServiceBNS: {
        unpack: 'json',
        pack: 'json',
        encoding: 'GBK',
        balance: 'random',
        protocol: 'http',
        server: [
            // 可选的备用服务器信息，启动时如果没能成功获取BNS信息，会使用备用服务器信息，如果没有备用信息则启动失败
            {
                host: 'st.yd.baidu.com',
                port: 80,
                idc: 'st'
            }, {
                host: 'tc.yd.baidu.com',
                port: 80,
                idc: 'tc'
            }
        ]
    },
    bookListService: {
        retry: 1,
        timeout: 500,
        // 设置Request参数的打包协议
        pack: 'form',
        // 设置Response的解包协议
        unpack: 'json',
        encoding: 'GBK',
        balance: 'random',
        protocol: 'http',
        // 设置协议的默认参数，可被用户覆盖
        method: 'POST',
        url: '/book/list',
        headers: {
            'user-agent': 'yog-ral'
        },
        server: [
            // 由于不是所有上游服务均设置了TAG，BNS也支持设置idc
            {
                host: 'st.yd.baidu.com',
                port: 80,
                idc: 'st'
            }
        ]
    },
    bookListServiceWithCUI: {
        retry: 1,
        timeout: 500,
        pack: 'form',
        unpack: 'json',
        encoding: 'GBK',
        balance: 'random',
        protocol: 'http',
        server: [{
            host: 'st.yd.baidu.com',
            port: 80,
            idc: 'st'
        }]
    }
};
