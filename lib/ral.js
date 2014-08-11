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
    _ = require('underscore'),
    iconv = require('iconv-lite'),
    Timer = require('./timer.js'),
    path = require('path');

iconv.extendNodeEncodings();

function RAL(serviceName, options){
    var payload, request, unpack, timer = new Timer(['request','talk', 'pack', 'write', 'read', 'unpack']);

    function getLogInfo(){
        return {
            service: serviceName,
            conv: conf.pack + '/' + conf.unpack,
            prot: conf.protocol,
            method: conf.method,
            path: conf.path,
            remote: conf.server.host + ':' + conf.server.port,
            cost: timer.context.request.cost.toFixed(3),
            talk: timer.context.talk.cost.toFixed(3),
            write: timer.context.write.cost.toFixed(3),
            read: timer.context.read.cost.toFixed(3),
            pack: timer.context.pack.cost.toFixed(3),
            unpack: timer.context.unpack.cost.toFixed(3)
        }
    }

    timer.start('request');
    options = options || {};
    var conf = config.getConf(serviceName);
    var context = conf.context;
    //choose a real server
    conf.server = context.balance.fetchServer(context.balanceContext);
    //normalize conf and options for merge to request options
    context.protocol.normalizeConfig(conf);
    context.protocol.normalizeConfig(options);
    util.merge(conf, options);
    timer.start('talk');
    //need pack data first to make sure the context which handled by converter can be passed into protocol
    timer.start('pack');
    if (options.data){
        //ctreate a pack converter stream
        payload = context.pack(conf, options.data);
    }
    timer.end('pack');
    timer.start('write');
    //create a response stream
    request = context.protocol.talk(conf, function(response){
        timer.end('write');
        timer.start('read');
        //pipe the response stream to unpack stream
        response.pipe(unpack);
        //transport error event from unpack
        response.on('error', function(err){
            logger.warning(util.qs());
            unpack.emit('error', err);
        });
        //store request time when response end
        response.once('data', function(){
            timer.end('read');
            timer.start('unpack');
        });
        //store request time when response end
        response.once('end', function(){
            //this is the end of the request
            timer.end('talk');
            timer.end('request');
            logger.notice(util.qs(getLogInfo()));
        });
    });
    if (options.data) {
        //transport error event from pack
        payload.on('error', function(err){
            request.emit('error', err);
        });
        payload.pipe(request);
    }
    //create a unpack converter stream
    unpack = context.unpack(conf);
    request.on('error', function(err){
        unpack.emit('error', err);
    });
    unpack.once('end', function(){
        timer.end('unpack');
    });
    unpack.on('error', function(err){
        var info = getLogInfo();
        info.errmsg = err.message;
        logger.warning(util.qs(info));
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