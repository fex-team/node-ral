/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/7
 */

'use strict';

var Converter = require('../../converter.js');
var logger = require('../../logger.js')('FormConverter');
var util = require('util');
var urlencode = require('urlencode');

function FormConverter() {
    Converter.call(this);
}

util.inherits(FormConverter, Converter);

FormConverter.prototype.unpack = function (config, data) {
    try {
        var object = urlencode.parse(data.toString(), {
            charset: config.encoding
        });
        logger.trace('unpack urlencode data succ ServiceID=' + config.serviceID);
        return object;
    }
    catch (ex) {
        logger.trace('unpack urlencode data failed ServiceID=' + config.serviceID);
        throw ex;
    }
};

FormConverter.prototype.pack = function (config, data) {
    data = data || {};
    var buffer;
    try {
        buffer = urlencode.stringify(data, {
            charset: config.encoding
        });
    }
    catch (e) {
        logger.trace('pack urlencode data failed data=' + data + ' ServiceID=' + config.serviceID);
        throw e;
    }
    config.headers = config.headers || {};
    var encoding = config.encoding ? config.encoding : 'utf-8';
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=' + encoding;
    config.headers['Content-Length'] = buffer.length;
    logger.trace('pack urlencode data succ ServiceID=' + config.serviceID + ' data=' + buffer);
    return buffer;
};

FormConverter.prototype.getName = function () {
    return 'form';
};

module.exports = FormConverter;
