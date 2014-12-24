/*
 * fis
 * http://fis.baidu.com/
 * 2014/12/24
 */

'use strict';

var Protocol = require('../../protocol.js');
var logger = require('../../logger.js')('SoapProtocol');
var util = require('util');
var soap = require('soap');
var EventEmitter = require('events').EventEmitter;
var clientCache = {};

function SoapProtocol(){
    Protocol.call(this);
}

util.inherits(SoapProtocol, Protocol);

SoapProtocol.prototype.getName = function(){
    return 'soap';
};

SoapProtocol.prototype.normalizeConfig = SoapProtocol.normalizeConfig = function(config){
    return config;
};

SoapProtocol.prototype._request = function(config, callback){
    var abort = false;
    var req = new EventEmitter();
    var res = new EventEmitter();

    config.wsdl = [
        config.https ? 'https' : 'http',
        '://', config.server.host, ':', config.server.port,
        config.path
    ].join('');

    function request(client){
        callback && callback(res);
        if (config.headers){
            client.addSoapHeader(config.headers, '', config.soapNamespace, config.soapXmlns);
        }
        if (config.payload === undefined){
            req.emit('error', new Error('soap protocol doesn\'t support stream converter'));
        }
        if (config.soapService && config.soapPort){
            client = client[config.soapService][config.soapPort];
        }

        client[config.method].call(client, config.payload, function(err, result){
            if (abort)
                return;
            if (err) return res.emit('error', err);
            res.emit('data', result);
            res.emit('end');
        });
    }

    if (!clientCache[config.wsdl] || config.noClientCache){
        soap.createClient(config.wsdl, config.options || {}, function(err, client){
            if (err){
                process.nextTick(function(){
                    req.emit('error', err);
                });
            }
            if (config.security){
                client.setSecurity(config.security);
            }
            request(client);
        });
    }else{
        request(clientCache[config.wsdl]);
    }

    req.abort = function(){
        abort = true;
    };
    return req;
};

module.exports = SoapProtocol;