/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/7
 */

'use strict';

var Converter = require('../../converter.js');
var FormConverter = require('./formConverter.js');
var logger = require('../../logger.js')('QuertStringConverter');
var util = require('util');
var ralUtil = require('../../util.js');

function QuertStringConverter() {
    Converter.call(this);
}

util.inherits(QuertStringConverter, Converter);

QuertStringConverter.prototype.unpack = FormConverter.prototype.unpack;

QuertStringConverter.prototype.pack = function (config, data) {
    data = data || {};
    config.query = config.query || {};
    ralUtil.merge(config.query, data);
    logger.trace('pack querystring data succ ServiceID=' + config.serviceID + ' data=' + JSON.stringify(config.query));
    return null;
};

QuertStringConverter.prototype.getName = function () {
    return 'querystring';
};

module.exports = QuertStringConverter;
