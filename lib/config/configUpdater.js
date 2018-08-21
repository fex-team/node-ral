/**
 * @file config updater for interval update config
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/19
 */

'use strict';

var fs = require('fs');
var config = require('../config.js');
var _ = require('underscore');
var EventEmitter = require('events').EventEmitter;
var logger = require('../logger.js')('ConfigUpdater');
var util = require('util');
var path = require('path');
var DATA_PATH = path.join(__dirname, '../../tmp/config_cache.json');
var TMP_PATH = path.join(__dirname, '../../tmp');

var DELAY_DELETE = 3000;
var CHECK_INTERVAL = 1000;

/**
 * Config Updater
 * used to update config with ConfigNormalizer
 *
 * @param {Object} options [service config]
 */
function Updater(options) {
    EventEmitter.call(this);
    options = options || {};
    this.tmpPath = options.tmpPath || TMP_PATH;
    this.dataPath = options.dataPath || DATA_PATH;
    // make sure tmpPath is exist and old cache file is deleted
    if (!fs.existsSync(this.tmpPath)) {
        try {
            fs.mkdirSync(this.tmpPath);
        }
        catch (e) {}
    }
    else {
        if (fs.existsSync(this.dataPath)) {
            try {
                fs.unlinkSync(this.dataPath);
            }
            catch (e) {}
        }
    }
    this.running = false;
}

util.inherits(Updater, EventEmitter);

/**
 * check whether the update is done
 *
 * @param  {Function} cb [description]
 */
Updater.prototype.checkResult = function (cb) {
    var me = this;
    var task;

    function check() {
        fs.readFile(me.dataPath, function (err, data) {
            if (err) {
                clearInterval(task);
                me.emit('read:error');
                logger.fatal('read config_cache failed');
                cb && cb(err);
                me.running = false;
                return;
            }
            var content = data.toString();
            if (content) {
                clearInterval(task);
                var conf;
                try {
                    conf = JSON.parse(content);
                }
                catch (e) {
                    me.emit('read:error');
                    logger.fatal('read config_cache failed, ' + e.stack);
                    cb && cb(e);
                    me.running = false;
                    return;
                }
                finally {
                    setTimeout(function () {
                        fs.unlink(me.dataPath, function () {});
                    }, DELAY_DELETE);
                }
                cb && cb(null, conf);
                logger.trace('read config_cache succ');
                me.emit('read:succ');
                me.running = false;
            }
            else {
                logger.trace('waiting config_cache');
                me.emit('read:fail');
            }
        });
    }

    task = setInterval(check, CHECK_INTERVAL);
    check();
};

/**
 * run interval update
 *
 * @param  {Function} cb  [description]
 * @param  {boolean}   all [description]
 */
Updater.prototype.update = function (cb, all) {
    var me = this;

    // make sure every updater won't run multi times
    if (me.running) {
        cb(new Error('updater still running'));
        return;
    }
    me.running = true;
    // create a file to share update result between cluster
    fs.open(me.dataPath, 'wx', function (err, fd) {
        if (err) {
            me.emit('wait');
            me.checkResult(cb);
        }
        else {
            logger.trace('config normalize start');
            me.emit('update:start');
            var conf = all ? config.getRawConf() : config.getUpdateNeededRawConf();
            var failed = false;
            _.map(conf, function (value, key) {
                try {
                    conf[key] = config.normalize(value);
                    // add a conf from tag
                    conf[key].__from__ = 'updater_' + (new Date()).getTime();
                }
                catch (e) {
                    logger.fatal('config normalize failed');
                    fs.close(fd, function (err) {
                        err && logger.warning('failed config_cache close: ' + err.message);
                    });
                    // delete failed file
                    fs.unlink(me.dataPath, function (err) {
                        err && logger.warning('failed config_cache delete failed' + err.message);
                    });
                    cb && cb(e);
                    me.emit('normalize:fail');
                    me.running = false;
                    failed = true;
                    return false;
                }
            });
            me.emit('update:end');
            !failed && fs.write(fd, JSON.stringify(conf), 0, 'utf-8', function (err) {
                err && logger.warning('config_cache write failed ' + err.message);
                me.checkResult(cb);
                fs.close(fd, function (err) {
                    err && logger.warning('config_cache close failed' + err.message);
                });
            });
        }
    });
};

var updater = new Updater();

module.exports = updater;
module.exports.Updater = Updater;
