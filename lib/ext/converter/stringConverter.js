/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/5
 */

'use strict';

var Converter = require('../../converter.js').Converter;
var logger = require('../../logger.js')('StringConverter');
var util = require('util');

function StringConverter() {
    Converter.call(this);
}

util.inherits(StringConverter, Converter);

StringConverter.prototype.unpack = function (convertContext, buffer) {
    var data;
    try {
        data = this.decode(buffer, convertContext.encoding);
    } catch (e) {
        logger.notice('unpack string data failed ServiceID=' + convertContext.serviceID);
        throw e;
    }
    logger.trace('pack string data succ ServiceID=' + convertContext.serviceID);
    return data;
};

StringConverter.prototype.pack = function (convertContext, data) {
    var buffer;
    try {
        buffer = this.encode(data.toString(), convertContext.encoding);
    } catch (e) {
        logger.notice('unpack string data failed ServiceID=' + convertContext.serviceID);
        throw e;
    }
    logger.trace('unpack string data succ ServiceID=' + convertContext.serviceID);
    return buffer;
};

StringConverter.prototype.getName = function () {
    return 'string';
};

module.exports = StringConverter;