/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/12/24
 */

'use strict';

module.exports.SOAP = {
    https: false,
    path: '/WeatherWS/Weather.asmx?WSDL',
    protocol: 'soap',
    pack: 'raw',
    unpack: 'raw',
    balance: 'random',
    timeout: 100000,
    server: [{
        host: 'wsf.cdyne.com',
        port: 80
    }]
};
