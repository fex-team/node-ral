/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/7
 */

'use strict';

var Converter = require('../../converter.js');
var logger = require('../../logger.js')('FormDataConverter');
var util = require('util');
var FormData = require('form-data');
var iconv = require('iconv-lite');
var _ = require('underscore');

function FormDataConverter(){
    Converter.call(this);
}

util.inherits(FormDataConverter, Converter);

FormDataConverter.prototype.unpack = function(config){
    throw new Error('Not Implemented');
};

FormDataConverter.prototype.pack = function(config, data){
    data = data || {};
    var formData = new FormData();
    //only handle fisrt level key-value
    _.map(data, function(value, key){
        if (_.isString(value)){
            value = iconv.encode(value, config.encoding);
        }
        formData.append(key, value);
    });
    config.headers = config.headers || {};
    config.headers['Content-Type'] =  "multipart/form-data;boundary=" + formData.getBoundary();
    return formData;
};

FormDataConverter.prototype.getName = function(){
    return 'formdata';
};

FormDataConverter.prototype.isStreamify = true;

module.exports = FormDataConverter;

