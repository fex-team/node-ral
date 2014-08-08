/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/7
 */

'use strict';

var Converter = require('../../converter.js');
var UrlDecodeStream = require('./urlencodeConverter.js').UrlDecodeStream;
var logger = require('../../logger.js')('UrlencodeConverter');
var util = require('util');
var ralUtil = require('../../util.js');
var Readable = require('stream').Readable;
var urlencode = require('urlencode');

function UrlEncodeConverter() {
    Converter.call(this);
}

util.inherits(UrlEncodeConverter, Converter);

UrlEncodeConverter.prototype.unpack = function (context) {
    return new UrlDecodeStream(context.encoding);
};

UrlEncodeConverter.prototype.pack = function (context, data) {
    data = data || {};
    context.query = context.query || {};
    ralUtil.merge(context.query, data);
    var rs = new Readable();
    try{
        context.query = urlencode.stringify(context.query, {
            charset: context.encoding
        });
        rs._read = function(){
            //pass a empty stream to protocol since data is in url query
            rs.push(null);
        };
    }catch(e){
        logger.notice('pack urlencode data failed data=' + data + ' ServiceID=' + context.serviceID);
        throw e;
    }
    context.headers = context.headers || {};

    context.headers['Content-Type'] = 'application/json';
    logger.trace('pack querystring data succ ServiceID=' + context.serviceID);
    return rs;
};

UrlEncodeConverter.prototype.getName = function () {
    return 'urlencode';
};

module.exports = UrlEncodeConverter;