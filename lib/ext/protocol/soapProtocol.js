/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/12/24
 */

'use strict';

var Protocol = require('../../protocol.js');
// var logger = require('../../logger.js')('SoapProtocol');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var clientCache = {};
var soap;

function SoapProtocol() {
    Protocol.call(this);
}

util.inherits(SoapProtocol, Protocol);

SoapProtocol.prototype.getName = function () {
    return 'soap';
};

SoapProtocol.prototype.normalizeConfig = SoapProtocol.normalizeConfig = function (config) {
    return config;
};

SoapProtocol.prototype._request = function (config, callback) {
    soap = soap || require('soap');
    var abort = false;
    var req = new EventEmitter();
    var res = new EventEmitter();

    config.wsdl = [
        config.https ? 'https' : 'http',
        '://', config.server.host, ':', config.server.port,
        config.path
    ].join('');

    function request(client) {
        callback && callback(res);
        if (config.payload === undefined) {
            req.emit('error', new Error('soap protocol doesn\'t support stream converter'));
        }
        if (config.soapService && config.soapPort) {
            client = client[config.soapService][config.soapPort];
        }

        client[config.method].call(client, config.payload, function (err, result) {
            if (abort) {
                return;
            }
            if (err) {
                res.emit('error', err);
                return;
            }
            res.emit('data', result);
            res.emit('end', result);
        });
    }

    if (!clientCache[config.wsdl] || config.noClientCache) {
        soap.createClient(config.wsdl, config.options || {}, function (err, client) {
            if (err) {
                setImmediate(function () {
                    req.emit('error', err);
                });
                return;
            }
            if (config.security) {
                client.setSecurity(config.security);
            }
            if (config.headers) {
                if (config.headers instanceof Array === false) {
                    config.headers = [config.headers];
                }
                config.headers.forEach(function (header) {
                    client.addSoapHeader(header.data, header.name, header.soapNamespace, header.soapXmlns);
                });
            }
            clientCache[config.wsdl] = client;
            request(client);
        });
    }
    else {
        request(clientCache[config.wsdl]);
    }

    req.abort = function () {
        abort = true;
    };
    return req;
};

module.exports = SoapProtocol;
