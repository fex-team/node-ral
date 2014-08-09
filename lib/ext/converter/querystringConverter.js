/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/7
 */

'use strict';

var Converter = require('../../converter.js');
var UrlDecodeStream = require('./urlencodeConverter.js').UrlDecodeStream;
var logger = require('../../logger.js')('QuertStringConverter');
var util = require('util');
var ralUtil = require('../../util.js');
var Readable = require('stream').Readable;
var urlencode = require('urlencode');

function QuertStringConverter() {
    Converter.call(this);
}

util.inherits(QuertStringConverter, Converter);

QuertStringConverter.prototype.unpack = function (config) {
    return new UrlDecodeStream(config.encoding);
};

QuertStringConverter.prototype.pack = function (config, data) {
    data = data || {};
    config.query = config.query || {};
    ralUtil.merge(config.query, data);
    config.headers = config.headers || {};
    config.headers['Content-Type'] = 'application/json';
    logger.trace('pack querystring data succ ServiceID=' + config.serviceID);

    var rs = new Readable();
    rs._read = function(){
        //pass a empty stream to protocol since data is in url query
        rs.push(null);
    };
    return rs;
};

QuertStringConverter.prototype.getName = function () {
    return 'querystring';
};

module.exports = QuertStringConverter;