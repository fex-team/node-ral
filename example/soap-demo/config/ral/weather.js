/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2015/5/10
 */

'use strict';

module.exports.WEATHER = {
    https: false,
    path: '/WeatherWS/Weather.asmx?WSDL',
    protocol: 'soap',
    pack: 'raw', // SOAP协议目前不支持其余数据打包格式，使用raw直接传递PlanObject对象
    unpack: 'raw', // SOAP协议目前不支持其余数据解包格式，使用raw直接接收PlanObject对象
    balance: 'random',
    timeout: 100000,
    server: [{
        host: 'wsf.cdyne.com',
        port: 80
    }]
};
