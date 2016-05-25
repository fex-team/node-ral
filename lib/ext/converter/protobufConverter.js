/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/5
 */

'use strict';

var Converter = require('../../converter.js');
var logger = require('../../logger.js')('ProtobufConverter');
var util = require('util');
var iconv = require('iconv-lite');
var ProtoBuf = require("protobufjs");

function ProtobufConverter() {
    this.globalPbBuilderCache = {};
    Converter.call(this);
}

util.inherits(ProtobufConverter, Converter);

ProtobufConverter.prototype.normalizeConfig = function(config) {
    // save proto build for every service
    var root = this.globalPbBuilderCache[config.serviceID];
    if (!root) {
        var builder = ProtoBuf.newBuilder(config.pbConfig || {});
        if (config.protoPaths instanceof Array === false) {
            config.protoPaths = [config.protoPaths];
        }
        config.protoPaths.forEach(function(protoPath) {
            ProtoBuf.loadProtoFile(protoPath, builder);
        });
        root = builder.build();
        this.globalPbBuilderCache[config.serviceID] = root;
    }
    config.protoRoot = root;
};

ProtobufConverter.prototype.unpack = function(config, data) {
    try {
        this.normalizeConfig(config);
        var root = config.protoRoot;
        if (!config.decodeMessageName) {
            throw new Error("decodeMessageName is needed unpack protobuf data");
        }
        var MessageClass;
        config.decodeMessageName.split('.').forEach(function(name) {
            MessageClass = MessageClass ? MessageClass[name] : root[name];
        });
        var obj = MessageClass.decode(data);
        logger.trace('unpack protobuf data succ ServiceID=' + config.serviceID);
        return obj;
    } catch (ex) {
        logger.trace('unpack protobuf data failed ServiceID=' + config.serviceID);
        throw ex;
    }
};

ProtobufConverter.prototype.pack = function(config, data) {
    data = data || {};
    var buffer;
    try {
        if (config.json2Pb === false) {
            buffer = data.toBuffer();
        } else {
            this.normalizeConfig(config);
            var root = config.protoRoot;
            if (!config.encodeMessageName) {
                throw new Error("encodeMessageName is needed to pack protobuf data");
            }
            var MessageClass;
            config.encodeMessageName.split('.').forEach(function(name) {
                MessageClass = MessageClass ? MessageClass[name] : root[name];
            });
            var message = new MessageClass(data);
            buffer = message.toBuffer();
        }
        if (!config.skipContentLength) {
            config.headers = config.headers || {};
            config.headers['Content-Length'] = buffer.length;
        }
    } catch (ex) {
        logger.trace('pack protobuf data failed data=' + data + ' ServiceID=' + config.serviceID);
        throw ex;
    }
    logger.trace('pack protobuf data succ ServiceID=' + config.serviceID + ' length=' + buffer.length);
    return buffer;
};

ProtobufConverter.prototype.getName = function() {
    return 'protobuf';
};

module.exports = ProtobufConverter;
