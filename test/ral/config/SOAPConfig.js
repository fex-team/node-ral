/*
 * fis
 * http://fis.baidu.com/
 * 2014/12/24
 */

'use strict';

module.exports.SOAP = {
    https: false,
    path: '/globalweather.asmx?WSDL',
    protocol: 'soap',
    pack: 'raw',
    unpack: 'raw',
    balance: 'random',
    timeout: 100000,
    server: [
        {
            host: 'www.webservicex.com',
            port: 80
        }
    ]
};