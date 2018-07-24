/**
 * node-ral
 * 2018/7/24
 *
 * @file sharedObject
 * @author niuxin@baidu.com
 */

var sharedConf = {
    balance: 'random',
    protocol: 'http',
    server: [{
        host: '127.0.0.1',
        port: 8192,
        idc: 'tc'
    }]
};

module.exports = {
    SHARED: sharedConf,

    DUPLICATED: sharedConf
};
