/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/7
 */

'use strict';

var Converter = require('../../converter.js');
// var logger = require('../../logger.js')('FormDataConverter');
var util = require('util');
var FormDataCls;
var iconv = require('iconv-lite');
var _ = require('underscore');

function FormDataConverter() {
    Converter.call(this);
}

util.inherits(FormDataConverter, Converter);

FormDataConverter.prototype.unpack = function (config) {
    throw new Error('Not Implemented');
};

FormDataConverter.prototype.pack = function (config, data) {
    data = data || {};
    if (!FormDataCls) {
        FormDataCls = require('form-data');
    }
    var formData = new FormDataCls();
    // only handle fisrt level key-value
    _.map(data, function (value, key) {
        var options = null;
        if (_.isString(value)) {
            value = iconv.encode(value, config.encoding);
        }
        if (value.options) {
            options = value.options;
            delete value.options;
        }
        formData.append(key, value, options);
    });
    config.headers = config.headers || {};
    config.headers['Content-Type'] = 'multipart/form-data;boundary=' + formData.getBoundary();
    if (config.syncLength) {
        config.headers['Content-Length'] = formData.getLengthSync();
    }
    return formData;
};

FormDataConverter.prototype.getName = function () {
    return 'formdata';
};

FormDataConverter.prototype.isStreamify = true;

module.exports = FormDataConverter;
