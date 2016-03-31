/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/5
 */

'use strict';

var Converter = require('../../converter.js');
var logger = require('../../logger.js')('JsonConverter');
var util = require('util');
var iconv = require('iconv-lite');

function JsonConverter() {
    Converter.call(this);
}

util.inherits(JsonConverter, Converter);

JsonConverter.prototype.unpack = function (config, data) {
    try {
        var str = iconv.decode(data, config.encoding);
        var obj = JSON.parse(str);
        logger.trace('unpack json data succ ServiceID=' + config.serviceID);
        return obj;
    }
    catch (ex) {
        logger.trace('unpack json data failed ServiceID=' + config.serviceID);
        throw ex;
    }
};

JsonConverter.prototype.pack = function (config, data) {
    data = data || {};
    var buffer;
    try {
        buffer = iconv.encode(JSON.stringify(data), config.encoding);
        if (!config.skipContentLength) {
            config.headers = config.headers || {};
            config.headers['Content-Length'] = buffer.length;
        }
    }
    catch (ex) {
        logger.trace('pack json data failed data=' + data + ' ServiceID=' + config.serviceID);
        throw ex;
    }
    logger.trace('pack json data succ ServiceID=' + config.serviceID + ' data=' + buffer);
    return buffer;
};

JsonConverter.prototype.getName = function () {
    return 'json';
};

module.exports = JsonConverter;
