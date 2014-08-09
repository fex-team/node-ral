/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/7
 */

'use strict';
var util = require('./util.js'),
    ctx = require('./ctx.js'),
    loggerGen = require('./logger.js'),
    logger = require('./logger.js')('RAL'),
    config = require('./config.js'),
    RalModule = require('./ralmodule.js'),
    async = require('async'),
    iconv = require('iconv-lite'),
    path = require('path');

iconv.extendNodeEncodings();

function RAL(serviceName, options){
    var payload, response, unpack;
    options = options || {};
    var conf = config.getConf(serviceName);
    var context = conf.context;
    //choose a real server
    conf.server = context.balance.fetchServer(context.balanceContext);
    //normalize conf and options for merge to request options
    context.protocol.normalizeConfig(conf);
    context.protocol.normalizeConfig(options);
    util.merge(conf, options);
    //need pack data first to make sure the context which handled by converter can be passed into protocol
    if (options.data){
        //ctreate a pack converter stream
        payload = context.pack(conf, options.data);
    }
    //create a response stream
    response = context.protocol.talk(conf);
    if (options.data) {
        //transport error event from pack
        payload.on('error', function(err){
            response.emit('error', err);
        });
        payload && payload.pipe(response);
    }
    //create a unpack converter stream
    unpack = context.unpack(conf);
    //pipe the response stream to unpack stream
    response.pipe(unpack);
    //transport error event from unpack
    response.on('error', function(err){
        unpack.emit('error', err);
    });
    return unpack;
}

var defaultOptions = {
    confDir : null,
    extDir : [__dirname + path.sep + '/ext'],
    logger : {
        "log_path" : __dirname + path.sep + './logs',
        "app" : "yog-ral"
    },
    currentIDC : 'all'
};

RAL.init = function(options, callback){
    options = util.merge(defaultOptions, options);
    ctx.currentIDC = options.currentIDC;
    loggerGen.options = options.logger;
    var loadExtensionTask = [];
    if (options.extDir){
        options.extDir.forEach(function(dir){
            loadExtensionTask.push(async.apply(RalModule.load, dir));
        });
    }
    async.parallel(loadExtensionTask, function(err){
        if (err){
            logger.fatal('yog-ral load extension failed' + err.message);
            callback && callback(err);
            return;
        }
        config.load(options.confDir, function(err){
            if (err){
                logger.fatal('yog-ral load config fail' + err.message);
                callback && callback(err);
            }
            callback && callback();
        });
    });

};

module.exports = RAL;