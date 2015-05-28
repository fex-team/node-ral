/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/12/24
 */

'use strict';

var config = {
    https: false,
    path: '/WeatherWS/Weather.asmx?WSDL',
    server: {
        host: 'wsf.cdyne.com',
        port: 80
    }
};

module.exports = config;
