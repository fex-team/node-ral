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
    var me = this;
    this._retryTimes = 0;
    this._requestID = Math.ceil(now()*100000);
    this.serviceName = serviceName;

    logger.notice('request start requestID=' + this._requestID);
    EventEmitter.call(this);
    options = options || {};
    var payload, request;
    var timer = this.timer = new Timer(['request','talk', 'pack', 'write', 'read', 'unpack']);
    timer.start('request');
    var conf = this.conf = config.getConf(serviceName);
    if (!conf){
        process.nextTick(function(){
           me.emit('error', new Error('invalid service name'))
        });
    }else{
        var context = conf.context;
        //normalize conf and options for merge to request options
        context.protocol.normalizeConfig(conf);
        context.protocol.normalizeConfig(options);
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
}

util.inherits(RalRunner, EventEmitter);

RalRunner.prototype.doRequest = function() {
    var timer = this.timer, context = this.conf.context,
        conf = this.conf, unpack, payload, request, response, abort = false,
        me = this;

    function onError (err){
        if (abort){
            return;
        }
        endRequest();
        me.onError(err);
    }

    function callRetry (err){
        if (abort){
            return;
        }
        endRequest();
        me.callRetry(err);
    }

    function onEnd (){
        //store request time when response end
        me.emit('end');
    }

    function onData (data) {
        //prevent data invoked after abort
        if (!abort){
            clearTimeout(me.timeout);
            timer.end('talk');
            timer.end('request');
            me.emit('data', data);
            logger.notice('request end ' + ralUtil.qs(me.getLogInfo()));
        }
    }

    function endRequest(){
        abort = true;
        //end timer
        timer.end('write');
        timer.end('talk');
        timer.end('request');
        //remove event listen
        if (unpack){
            unpack.removeAllListeners();
            unpack.on('error', function(){});
            unpack.end('abort');
        }
        if (request){
            //end stream
            request.abort();
            request.removeAllListeners('error');
            request.on('error', function(){});
        }
        if (response){
            response.removeAllListeners();
        }
    }

    function onTimeout (){
        logger.trace('request timeout');
        callRetry(new Error('request time out'));
    }

    /**
     * unpack response data and trigger onData
     */
    function unpackResponse (){
        if (context.unpackConverter.isStreamify){
            unpack = context.unpack(conf);
            unpack.on('error', callRetry);
            unpack.once('end', function(){
                timer.end('unpack');
            });
            unpack.on('data', onData);
            response.pipe(unpack);
        }else{
            response.on('data', function(data){
                try{
                    timer.start('unpack');
                    unpack = context.unpack(conf, data);
                    timer.end('unpack');
                }catch(ex){
                    callRetry(ex);
                    return;
                }
                onData(unpack);
            });
        }
    }

    function onResp(resp){
        timer.end('write');
        if (abort){
            return;
        }
        response = resp;
        timer.start('read');
        response.on('data', function() {
            timer.end('read');
            if (context.unpackConverter.isStreamify) {
                timer.start('unpack');
            }
        });
        //pipe the response stream to unpack stream
        unpackResponse();
        //transport error event from unpack
        response.on('error', callRetry);
        //store request time when response end
        response.once('end', onEnd);
    }

    timer.start('talk');
    //need pack data first to make sure the context which handled by converter can be passed into protocol
    timer.start('pack');
    if (conf.data){
        //create a pack converter stream
        try{
            payload = context.pack(conf, conf.data);
        }catch(ex){
            //pack error won't call retry
            me.onError(ex);
        }
    }
    timer.end('pack');

    //set payload directly when converter is not streamify
    if (context.packConverter.isStreamify === false){
        conf.payload = payload;
    }

    //choose a real server
    conf.server = context.balance.fetchServer(context.balanceContext);

    //set timeout
    this.timeout = setTimeout(onTimeout, conf.timeout);

    //create a request stream
    timer.start('write');
    try{
        request = this.request = context.protocol.talk(conf,onResp);
    }catch(err){
        //delay error trigger to let user caught error
        process.nextTick(function(){
            onError(err);
        });
        return;
    }
    request.on('error', callRetry);

    if (payload && context.packConverter.isStreamify) {
        //transport error event from pack
        payload.on('error', onError);
        payload.pipe(request);
    }
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

RAL.appendExtPath = function(path){
    defaultOptions.extDir.push(path);
};

RAL.setConfigNormalizer = function(normalizers){
    config.normalizerManager.setConfigNormalizer(normalizers);
};

RAL.init = function(options){
    options = ralUtil.merge(defaultOptions, options);
    ctx.currentIDC = options.currentIDC;
    loggerGen.options = options.logger;
    options.extDir.map(RalModule.load);
    config.load(options.confDir);
};

module.exports = RAL;