/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/7
 */

'use strict';
var ralUtil = require('./util.js'),
    util = require('util'),
    ctx = require('./ctx.js'),
    loggerGen = require('./logger.js'),
    logger = require('./logger.js')('RAL'),
    config = require('./config.js'),
    RalModule = require('./ralmodule.js'),
    async = require('async'),
    iconv = require('iconv-lite'),
    EventEmitter = require('events').EventEmitter,
    now = require('performance-now'),
    Timer = require('./timer.js'),
    path = require('path');

iconv.extendNodeEncodings();

function RAL(serviceName, options){
    return new RalRunner(serviceName, options);
}


function RalRunner(serviceName, options){
    logger.trace('request start');
    var me = this;
    this.serviceName = serviceName;
    EventEmitter.call(this);
    options = options || {};
    var payload, request, onerror = this.onError.bind(this);
    var timer = this.timer = new Timer(['request','talk', 'pack', 'write', 'read', 'unpack']);
    timer.start('request');
    var conf = this.conf = config.getConf(serviceName);

    var context = conf.context;
    //normalize conf and options for merge to request options
    context.protocol.normalizeConfig(conf);
    context.protocol.normalizeConfig(options);
    this._retryTimes = 0;
    this._requestID = Math.ceil(now()*100000);
    ralUtil.merge(conf, options);
    this.doRequest();

    this.on('retry', function(err){
        if (this._retryTimes >= conf.retry){
            me.emit('error', err);
        }else{
            this._retryTimes ++;
            timer.start('request');
            timer.start('talk');
            logger.trace('start retry request');
            me.doRequest(payload);
        }
    })
}

util.inherits(RalRunner, EventEmitter);

RalRunner.prototype.doRequest = function() {
    var timer = this.timer,
        context = this.conf.context,
        conf = this.conf,
        unpack,
        payload,
        response,
        abort = false,
        onError = this.onError.bind(this),
        callRetry = this.callRetry.bind(this),
        onData = function(data){
            //prevent data invoked after abort
            if (!abort){
                me.emit('data', data);
            }
        },
        onEnd = function(){
            //store request time when response end
            clearTimeout(me.timeout);
            timer.end('talk');
            timer.end('request');
            me.emit('end');
            logger.notice('request end ' + ralUtil.qs(me.getLogInfo()));
        },
        onTimeout = function(){
            abort = true;
            //end timer
            timer.end('write');
            timer.end('talk');
            timer.end('request');
            //end stream
            request.abort();
            //remove event listen
            if (unpack){
                unpack.removeListener('error', callRetry);
                unpack.on('error', function(){});
                unpack.removeListener('data', onData);
                unpack.end('abort');
            }
            if (response){
                response.removeListener('error', callRetry);
                response.removeListener('end', onEnd);
            }
            logger.trace('request timeout');
            callRetry(new Error('request time out'));
        },
        me = this;


    timer.start('talk');
    //need pack data first to make sure the context which handled by converter can be passed into protocol
    timer.start('pack');
    if (conf.data){
        //ctreate a pack converter stream
        try{
            payload = context.pack(conf, conf.data);
        }catch(e){
            me.onerror(e);
        }
    }
    timer.end('pack');

    //choose a real server
    conf.server = context.balance.fetchServer(context.balanceContext);

    //set timeout
    this.timeout = setTimeout(onTimeout, conf.timeout);

    //create a response stream
    timer.start('write');
    var request = this.request = context.protocol.talk(conf, function(resp){
        response = resp;
        timer.end('write');
        timer.start('read');
        //pipe the response stream to unpack stream
        response.pipe(unpack);
        //transport error event from unpack
        response.on('error', callRetry);
        //store request time when response end
        response.once('data', function(){
            timer.end('read');
            timer.start('unpack');
        });
        //this is the end of the request
        response.once('end', onEnd);
    });
    if (payload) {
        //transport error event from pack
        payload.on('error', onError);
        payload.pipe(request);
    }
    //create a unpack converter stream
    unpack = context.unpack(conf);
    request.on('error', callRetry);
    unpack.on('error', callRetry);
    unpack.once('end', function(){
        timer.end('unpack');
    });
    unpack.on('data', onData);
};


RalRunner.prototype.getLogInfo = function(){
    return {
        service: this.serviceName,
        requestID: this._requestID,
        conv: this.conf.pack + '/' + this.conf.unpack,
        prot: this.conf.protocol,
        method: this.conf.method,
        path: this.conf.path,
        remote: this.conf.server.host + ':' + this.conf.server.port,
        cost: this.timer.context.request.cost.toFixed(3),
        talk: this.timer.context.talk.cost.toFixed(3),
        write: this.timer.context.write.cost.toFixed(3),
        read: this.timer.context.read.cost.toFixed(3),
        pack: this.timer.context.pack.cost.toFixed(3),
        unpack: this.timer.context.unpack.cost.toFixed(3),
        retry: this._retryTimes + '/' + this.conf.retry
    }
};


RalRunner.prototype.onError = function(err){
    clearTimeout(this.timeout);
    var info = this.getLogInfo();
    info.errmsg = err.message;
    logger.warning('request failed ' + ralUtil.qs(info));
    this.emit('error', err);
};

RalRunner.prototype.callRetry = function(err){
    clearTimeout(this.timeout);
    var info = this.getLogInfo();
    info.errmsg = err.message;
    logger.trace('request failed errmsg=' + info.errmsg);
    logger.warning('request failed ' + ralUtil.qs(info));
    this.emit('retry', err);
};

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
    options = ralUtil.merge(defaultOptions, options);
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