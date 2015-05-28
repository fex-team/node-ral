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
    }
};
