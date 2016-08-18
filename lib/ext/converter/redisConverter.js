/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2016/8/19
 */

'use strict';


var Converter = require('../../converter.js');
// var logger = require('../../logger.js')('RedisConverter');
var util = require('util');

function RedisConverter() {
    Converter.call(this);
}

util.inherits(RedisConverter, Converter);

RedisConverter.prototype.unpack = function (config, data) {
    return data;
};

RedisConverter.prototype.pack = function (config, data) {
    var arrData = [];
    if (data instanceof Array === false) {
        if (data.key) {
            arrData.push(data.key);
            if (data.value) {
                if (data.value instanceof Array) {
                    arrData = arrData.concat(data.value);
                }
                else {
                    arrData.push(data.value);
                }
            }
        }
        else if (typeof data === 'string') {
            arrData.push(data);
        }
        else {
            throw new Error("invalid redis data format, try key value pair");
        }
    }
    else {
        arrData = data;
    }
    return arrData;
};

RedisConverter.prototype.getName = function () {
    return 'redis';
};

module.exports = RedisConverter;
