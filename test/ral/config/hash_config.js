/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2016/4/27
 */

module.exports = {
    hashService: {
        unpack: 'json',
        pack: 'json',
        // 指定服务端交互的编码格式，由于Node.js环境只支持UTF-8，因此yog-ral会自动进行转码工作
        encoding: 'GBK',
        balance: 'hashring',
        protocol: 'http',
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
