/**
 * @file ral request core
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/7
 */

/* eslint-disable fecs-camelcase, camelcase */

'use strict';
var ralUtil = require('./util.js');
var util = require('util');
var ctx = require('./ctx.js');
var loggerGen = require('./logger.js');
var logger = require('./logger.js')('RAL');
var config = require('./config.js');
var RalModule = require('./ralmodule.js');
// var iconv = require('iconv-lite');
var EventEmitter = require('events').EventEmitter;
var now = require('performance-now');
var Timer = require('./timer.js');
var stream = require('stream');
var path = require('path');
var MockManager = require('./mock.js');
var mockManager = null;

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
    this.chosenBackend = [];

    logger.trace('request start requestID=' + this._requestID);
    EventEmitter.call(this);
    options = options || {};
    var timer = this.timer = new Timer(['request', 'talk', 'pack', 'write', 'read', 'unpack']);
    timer.start('request');
    var conf = this.conf = config.getConf(serviceName);
    if (!conf) {
        me.throwError(new Error('Invalid service name : ' + serviceName));
    } else if (conf._isValid !== true) {
        me.throwError(new Error('Service ' + serviceName + ' is invalid since ' + conf._validateFailInfo));
    }
    else {
        var context = conf.context = config.getContext(serviceName, options);
        // normalize conf and options for merge to request options
        context.protocol.normalizeConfig(conf);
        context.protocol.normalizeConfig(options);
        ralUtil.merge(conf, options);

        if (mockManager) {
            var ret = mockManager.excuteMock(serviceName, conf, function (err, data) {
                if (err) {
                    me.throwError(err);
                }
                else {
                    me.emit('data', data);
                    me.emit('end');
                }
            });
            if (ret) {
                return;
            }
        }

        this.on('retry', function (err) {
            if (this._retryTimes >= conf.retry) {
                me.throwError(err);
            }
            else {
                this._retryTimes++;
                timer.start('request');
                timer.start('talk');
                logger.trace('start retry request.');
                me.doRequest();
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

    function callReqError(err) {
        if (abort) {
            return;
        }
        endRequest();
        me.throwError(err);
    }

    function callReqRetry(err) {
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
        if (me.conf.includeExtras) {
            data[me.conf.extrasKey || '_extras'] = me.extras;
        }
        if (!abort) {
            clearTimeout(me.timeout);
            timer.end('talk');
            timer.end('request');
            if (conf.catchCallback) {
                try {
                    me.emit('data', data, me.extras);
                }
                catch (err) {
                    callReqError(err);
                }
            }
            else {
                me.emit('data', data, me.extras);
            }
            me.responseData = data;
            logger.notice('request end ' + ralUtil.qs(me.getLogInfo()));
        }
    }

    function endRequest() {
        abort = true;
        // end timer
        timer.end('read');
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
            request.removeAllListeners();
            request.on('error', function () {});
        }
        if (response) {
            response.removeAllListeners();
            response.on('error', function () {});
        }
    }

    function onTimeout() {
        callReqRetry(new Error('request timeout'));
    }

    /**
     * unpack response data and trigger onData
     */
    function unpackResponse() {
        response.on('extras', function (extras) {
            me.extras = extras;
        });
        if (context.unpackConverter.isStreamify) {
            unpack = context.unpack(conf);
            if (unpack instanceof stream.Stream === false) {
                callReqError(new Error('invalid unpack data: not a stream but isStreamify is true'));
                return;
            }
            unpack.on('error', callReqRetry);
            unpack.once('end', function () {
                timer.end('unpack');
            });
            // return unpack in nextTick to get correct extras data
            process.nextTick(function () {
                onData(unpack);
                response.pipe(unpack);
            });
        }
        else {
            response.on('end', function (data) {
                try {
                    timer.start('unpack');
                    unpack = context.unpack(conf, data);
                    timer.end('unpack');
                }
                catch (ex) {
                    callReqRetry(ex);
                    return;
                }
                onData(unpack);
            });
        }
    }

    function onResp(resp) {
        response = resp;
        timer.end('write');
        if (abort) {
            response.removeAllListeners();
            response.on('error', function () {});
            return;
        }
        timer.start('read');
        // transport error event from unpack
        response.on('error', callReqRetry);
        // store request time when response end
        response.once('end', onEnd);
        response.on('data', function () {
            timer.end('read');
            if (context.unpackConverter.isStreamify) {
                timer.start('unpack');
            }
        });
        // pipe the response stream to unpack stream
        unpackResponse();
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
            callReqError(err);
            return;
        }
    }
    timer.end('pack');

    // set payload directly when converter is not streamify
    if (context.packConverter.isStreamify === false) {
        conf.payload = payload;
    }

    if (context.packConverter.isStreamify && conf.retry !== 0 && this._retryTimes !== 0) {
        return callReqError(new Error('streamify pack doesn\'t support retry'));
    }

    // choose a real server
    try {
        conf.server = context.balance.fetchServer(context.balanceContext, conf, this.chosenBackend);
        this.chosenBackend.push(conf.server);
    }
    catch (err) {
        callReqError(err);
        return;
    }

    // set timeout
    this.timeout = setTimeout(onTimeout.bind(me), conf.timeout);

    // create a request stream
    timer.start('write');
    try {
        request = this.request = context.protocol.talk(conf, onResp);
    }
    catch (err) {
        callReqError(err);
        return;
    }
    request.on('error', callReqRetry);

    if (payload && context.packConverter.isStreamify) {
        if (payload instanceof stream.Stream === false) {
            callReqError(new Error('invalid pack data: not a stream but isStreamify is true'));
            return;
        }
        // transport error event from pack
        payload.on('error', callReqError);
        payload.pipe(request);
    }
};

RalRunner.prototype.getLogInfo = function () {
    var defaultLog = {
        service: this.serviceName,
        requestID: this._requestID,
        conv: this.conf.pack + '/' + this.conf.unpack,
        prot: this.conf.protocol,
        method: this.conf.method,
        path: this.conf.realPath || this.conf.path,
        proxy: this.conf.proxy,
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
    // resolve custom loginfo
    if (this.conf.customLog) {
        var data = {
            requestContext: this.conf,
            responseContext: {
                extras: this.extras,
                body: this.responseData
            }
        };
        for (var i = 0; i < this.conf.customLog.length; i++) {
            var key = this.conf.customLog[i].key;
            var param = this.conf.customLog[i].param;
            defaultLog[key] =  param.reduce(function (data, path) {
                if (data && typeof data === 'object') {
                    return data[path];
                }
                return undefined;
            }, data);
        }
    }
    return defaultLog;
};

RalRunner.prototype.throwError = function (err) {
    var me = this;
    clearTimeout(this.timeout);
    // add auto degrade
    if (me.conf && me.conf.degrade) {
        var val;
        var degrade = me.conf.degrade;
        // allow define a function for degrade
        if (typeof degrade === 'function') {
            try {
                val = degrade(me.conf);
            }
            catch (e) {
                return setImmediate(function () {
                    me.emit('error', e);
                });
            }
        }
        else {
            val = degrade;
        }
        if (val) {
            return setImmediate(function () {
                logger.warning('service degraded since request failed: ' + err.message);
                me.emit('data', val);
                me.emit('end');
            });
        }
    }
    setImmediate(function () {
        me.emit('error', err);
    });
};

RalRunner.prototype.callRetry = function (err) {
    clearTimeout(this.timeout);
    if (!err._hasReqInfo) {
        var info = this.getLogInfo();
        err._hasReqInfo = true;
        err.message += ' ' + ralUtil.qs(info);
    }
    var msg = 'request failed. errmsg=' + err.message;
    logger.notice(msg);
    logger.warning(msg);
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
    RAL.inputOptions = options;
    config.clearConf();
    var defaultOptionsClone = ralUtil.deepClone(defaultOptions);
    var ralOptions = ralUtil.merge(defaultOptionsClone, options);
    ralOptions.currentIDC && (ctx.currentIDC = ralOptions.currentIDC);
    ralOptions.updateInterval && (ctx.updateInterval = ralOptions.updateInterval);
    loggerGen.options = ralOptions.logger;
    RalModule.clearCache();
    ralOptions.extDir.map(RalModule.load);
    if (ralOptions.confDir) {
        config.load(ralOptions.confDir);
    }
    // load mock config
    mockManager = new MockManager({
        path: ralOptions.mockDir
    });
    ctx.DEBUG = (process.env.RAL_DEBUG === 'true' || process.env.RAL_DEBUG === '1');
};

RAL.reload = function (options) {
    if (options) {
        RAL.init(options);
    } else {
        RAL.init(RAL.inputOptions);
    }
}

module.exports = RAL;
