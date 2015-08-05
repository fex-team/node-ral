/**
 * @file ral request core
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/7
 */

/*eslint-disable fecs-camelcase, camelcase */

'use strict';
var ralUtil = require('./util.js');
var util = require('util');
var ctx = require('./ctx.js');
var loggerGen = require('./logger.js');
var logger = require('./logger.js')('RAL');
var config = require('./config.js');
var RalModule = require('./ralmodule.js');
var iconv = require('iconv-lite');
var EventEmitter = require('events').EventEmitter;
var now = require('performance-now');
var Timer = require('./timer.js');
var stream = require('stream');
var path = require('path');

iconv.extendNodeEncodings();

function RAL(serviceName, options) {
    return new RalRunner(serviceName, options);
}

/**
 * ral request runner
 *
 * @param {string} serviceName [description]
 * @param {Object} options     [description]
 */
function RalRunner(serviceName, options) {
    var me = this;
    this._retryTimes = 0;
    this._requestID = Math.ceil(now() * 100000);
    this.serviceName = serviceName;

    logger.trace('request start requestID=' + this._requestID);
    EventEmitter.call(this);
    options = options || {};
    var payload;
    var timer = this.timer = new Timer(['request', 'talk', 'pack', 'write', 'read', 'unpack']);
    timer.start('request');
    var conf = this.conf = config.getConf(serviceName);
    if (!conf) {
        var error = new Error('invalid service name');
        process.nextTick(function () {
            me.emit('error', error);
        });
    }
    else {
        var context = conf.context = config.getContext(serviceName, options);
        // normalize conf and options for merge to request options
        context.protocol.normalizeConfig(conf);
        context.protocol.normalizeConfig(options);
        ralUtil.merge(conf, options);

        this.on('retry', function (err) {
            if (this._retryTimes >= conf.retry) {
                process.nextTick(function () {
                    me.emit('error', err);
                });
            }
            else {
                this._retryTimes++;
                timer.start('request');
                timer.start('talk');
                logger.trace('start retry request');
                me.doRequest(payload);
            }
        });

        this.doRequest();
    }
}

util.inherits(RalRunner, EventEmitter);

/**
 * node-ral request handler
 *
 */
RalRunner.prototype.doRequest = function () {
    var timer = this.timer;
    var context = this.conf.context;
    var conf = this.conf;
    /**
     * unpack stream
     */
    var unpack;
    /**
     * request body
     */
    var payload;
    /**
     * request writeable stream
     */
    var request;
    /**
     * response readable stream
     */
    var response;
    /**
     * abort flag
     *
     * @type {Boolean}
     */
    var abort = false;
    var me = this;

    function onError(err) {
        if (abort) {
            return;
        }
        endRequest();
        me.onError(err);
    }

    function callRetry(err) {
        if (abort) {
            return;
        }
        endRequest();
        me.callRetry(err);
    }

    function onEnd() {
        // store request time when response end
        me.emit('end');
    }

    function onData(data) {
        // prevent data invoked after abort
        if (!abort) {
            clearTimeout(me.timeout);
            timer.end('talk');
            timer.end('request');
            if (conf.catchCallback) {
                try {
                    me.emit('data', data);
                }
                catch (err) {
                    onError(err);
                }
            }
            else {
                me.emit('data', data);
            }
            logger.notice('request end ' + ralUtil.qs(me.getLogInfo()));
        }
    }

    function endRequest() {
        abort = true;
        // end timer
        timer.end('write');
        timer.end('talk');
        timer.end('request');
        // remove event listen
        if (unpack && unpack.removeAllListeners) {
            unpack.removeAllListeners();
            unpack.on('error', function () {});
            unpack.end('abort');
        }
        if (request) {
            // end stream
            request.abort();
            request.removeAllListeners('error');
            request.on('error', function () {});
        }
        if (response) {
            response.removeAllListeners();
            response.on('error', function () {});
        }
    }

    function onTimeout() {
        logger.trace('request timeout');
        callRetry(new Error('request time out'));
    }

    /**
     * unpack response data and trigger onData
     */
    function unpackResponse() {
        if (context.unpackConverter.isStreamify) {
            unpack = context.unpack(conf);
            if (unpack instanceof stream.Stream === false) {
                onError(new Error('invalid unpack data: not a stream but isStreamify is true'));
                return;
            }
            unpack.on('error', callRetry);
            unpack.once('end', function () {
                timer.end('unpack');
            });
            onData(unpack);
            response.pipe(unpack);
        }
        else {
            response.on('data', function (data) {
                try {
                    timer.start('unpack');
                    unpack = context.unpack(conf, data);
                    timer.end('unpack');
                }
                catch (ex) {
                    callRetry(ex);
                    return;
                }
                onData(unpack);
            });
        }
    }

    function onResp(resp) {
        timer.end('write');
        if (abort) {
            return;
        }
        response = resp;
        timer.start('read');
        response.on('data', function () {
            timer.end('read');
            if (context.unpackConverter.isStreamify) {
                timer.start('unpack');
            }
        });
        // pipe the response stream to unpack stream
        unpackResponse();
        // transport error event from unpack
        response.on('error', callRetry);
        // store request time when response end
        response.once('end', onEnd);
    }

    timer.start('talk');
    // need pack data first to make sure the context which handled by converter can be passed into protocol
    timer.start('pack');
    if (conf.data) {
        // create a pack converter stream
        try {
            payload = context.pack(conf, conf.data);
        }
        catch (err) {
            onError(err);
            return;
        }
    }
    timer.end('pack');

    // set payload directly when converter is not streamify
    if (context.packConverter.isStreamify === false) {
        conf.payload = payload;
    }

    // choose a real server
    conf.server = context.balance.fetchServer(context.balanceContext);

    // set timeout
    this.timeout = setTimeout(onTimeout, conf.timeout);

    // create a request stream
    timer.start('write');
    try {
        request = this.request = context.protocol.talk(conf, onResp);
    }
    catch (err) {
        onError(err);
        return;
    }
    request.on('error', callRetry);

    if (payload && context.packConverter.isStreamify) {
        if (payload instanceof stream.Stream === false) {
            onError(new Error('invalid pack data: not a stream but isStreamify is true'));
            return;
        }
        // transport error event from pack
        payload.on('error', onError);
        payload.pipe(request);
    }
};


RalRunner.prototype.getLogInfo = function () {
    return {
        service: this.serviceName,
        requestID: this._requestID,
        conv: this.conf.pack + '/' + this.conf.unpack,
        prot: this.conf.protocol,
        method: this.conf.method,
        path: this.conf.path,
        query: JSON.stringify(this.conf.query),
        remote: this.conf.server.host + ':' + this.conf.server.port,
        cost: this.timer.context.request.cost.toFixed(3),
        talk: this.timer.context.talk.cost.toFixed(3),
        write: this.timer.context.write.cost.toFixed(3),
        read: this.timer.context.read.cost.toFixed(3),
        pack: this.timer.context.pack.cost.toFixed(3),
        unpack: this.timer.context.unpack.cost.toFixed(3),
        retry: this._retryTimes + '/' + this.conf.retry
    };
};


RalRunner.prototype.onError = function (err) {
    var me = this;
    clearTimeout(this.timeout);
    var info = this.getLogInfo();
    info.errmsg = err.message;
    logger.fatal('request failed ' + ralUtil.qs(info));
    process.nextTick(function () {
        me.emit('error', err);
    });
};

RalRunner.prototype.callRetry = function (err) {
    clearTimeout(this.timeout);
    var info = this.getLogInfo();
    info.errmsg = err.message;
    logger.trace('request failed and call retry errmsg=' + info.errmsg);
    logger.warning('request failed ' + ralUtil.qs(info));
    this.emit('retry', err);
};

var defaultOptions = {
    confDir: null,
    extDir: [path.join(__dirname, '/ext')],
    logger: {
        log_path: path.dirname(require.main ? require.main.filename : __dirname) + path.sep + './logs',
        IS_OMP: 2,
        app: 'ral'
    },
    currentIDC: 'all'
};

/**
 * append extesion module path
 *
 * @param  {string} extPath [description]
 */
RAL.appendExtPath = function (extPath) {
    defaultOptions.extDir.push(extPath);
};

/**
 * set config normalizer
 *
 * @param {Array} normalizers [description]
 */
RAL.setConfigNormalizer = function (normalizers) {
    config.normalizerManager.setConfigNormalizer(normalizers);
};

/**
 * get normlized config
 *
 * @param  {string} name [description]
 * @return {Object}      [description]
 */
RAL.getConf = function (name) {
    return config.getConf(name);
};

/**
 * get raw conf
 *
 * @param  {string} name [description]
 * @return {Object}      [description]
 */
RAL.getRawConf = function (name) {
    return config.getRawConf(name);
};

/**
 * init ral instance
 *
 * @param  {Object} options [description]
 */
RAL.init = function (options) {
    options = ralUtil.merge(defaultOptions, options);
    options.currentIDC && (ctx.currentIDC = options.currentIDC);
    options.updateInterval && (ctx.updateInterval = options.updateInterval);
    loggerGen.options = options.logger;
    options.extDir.map(RalModule.load);
    config.load(options.confDir);
    ctx.DEBUG = (process.env.RAL_DEBUG === 'true');
};

module.exports = RAL;
