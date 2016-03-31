/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/5
 */

'use strict';

var Converter = require('../../converter.js');
var logger = require('../../logger.js')('StringConverter');
var util = require('util');
var iconv = require('iconv-lite');

function StringConverter() {
    Converter.call(this);
}

util.inherits(StringConverter, Converter);

StringConverter.prototype.unpack = function (config, data) {
    data = data || '';
    var str;
    try {
        str = iconv.decode(data, config.encoding);
    }
    catch (e) {
        logger.trace('unpack string data failed data=' + data + ' ServiceID=' + config.serviceID);
        throw e;
    }
    logger.trace('unpack string data succ ServiceID=' + config.serviceID);
    return str;
};

StringConverter.prototype.pack = function (config, data) {
    data = data || '';
    var buffer;
    try {
        buffer = iconv.encode(data.toString(), config.encoding);
        if (!config.skipContentLength) {
            config.headers = config.headers || {};
            config.headers['Content-Length'] = buffer.length;
        }
    }
    catch (e) {
        logger.trace('pack string data failed data=' + data + ' ServiceID=' + config.serviceID);
        throw e;
    }
    logger.trace('pack string data succ ServiceID=' + config.serviceID + ' data=' + buffer);
    return buffer;
};

StringConverter.prototype.getName = function () {
    return 'string';
};

module.exports = StringConverter;
