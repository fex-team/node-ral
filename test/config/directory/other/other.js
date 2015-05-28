/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/4
 */

'use strict';

module.exports = {
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
