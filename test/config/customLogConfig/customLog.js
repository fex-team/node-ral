/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2016/11/17
 */

'use strict';

module.exports = {
    CUSTOM_LOG: {
        unpack: 'json',
        pack: 'json',
        // 指定服务端交互的编码格式，由于Node.js环境只支持UTF-8，因此yog-ral会自动进行转码工作
        encoding: 'GBK',
        balance: 'random',
        protocol: 'http',
        customLog: {
            'tracecode': 'responseContext.extras.headers.tracecode',
            'logid': 'requestContext.headers.x_bd_logid',
            'none': 'aaa.bbb',
            'wrongformat': ["a", "b"],
        },
        server: [{
            host: '127.0.0.1',
            port: 8399
        }]
    }
}