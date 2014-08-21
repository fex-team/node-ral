/*
 * fis
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
var cluster = require('cluster');
var dataPath = __dirname + path.sep + '../../tmp/config_cache.json';
var tmpPath = __dirname + path.sep + '../../tmp';

var DELAY_DELETE = 3000;
var CHECK_INTERVAL = 1000;

/**
 * Config Updater
 *
 * used to update config with ConfigNormalizer
 * @constructor
 */
function Updater(){
    EventEmitter.call(this);
    //make sure tmpPath is exist and old cache file is deleted
    if (!fs.existsSync(tmpPath)){
        fs.mkdirSync(tmpPath);
    }else{
        if (fs.existsSync(dataPath)){
            try{
                fs.unlinkSync(dataPath);
            }catch(e){
            }
        }
    }
    this.running = false;
}

util.inherits(Updater, EventEmitter);

Updater.prototype.checkResult = function(cb){
    var me = this;
    function _check(){
        fs.readFile(dataPath, function(err, data){
            if (err){
                clearInterval(task);
                me.emit('read:error');
                logger.fatal('read config_cache failed');
                cb && cb(err);
                me.running = false;
                return;
            }
            var content = data.toString();
            if (content){
                clearInterval(task);
                var config = JSON.parse(content);
                setTimeout(function(){
                    fs.unlink(dataPath, function(err){
                        err && logger.warning('config_cache delete failed' + err.message);
                    });
                },DELAY_DELETE);
                cb && cb(null, config);
                logger.trace('read config_cache succ');
                me.emit('read:succ');
                me.running = false;
            }else{
                logger.trace('waiting config_cache');
                me.emit('read:fail');
            }
        });
    }
    var task = setInterval(_check, CHECK_INTERVAL);
    _check();
};

Updater.prototype.update = function(cb, all){
    var me = this;

    //make sure every updater won't run multi times
    if (me.running){
        cb(new Error("updater still running"));
        return;
    }
    me.running = true;
    //create a file to share update result between cluster
    fs.open(dataPath, 'wx', function(err, fd){
        if (err){
            me.emit('wait');
            me.checkResult(cb);
        }else{
            logger.trace('config normalize start');
            me.emit('update:start');
            var conf = all? config.getRawConf() : config.getUpdateNeededRawConf();
            _.map(conf, function(value, key){
                try{
                    conf[key] = config.normalize(value);
                    //add a conf from tag
                    conf[key].__from__ = 'updater_' + (new Date()).getTime();
                }catch(e){
                    logger.fatal('config normalize failed');
                    fs.close(fd);
                    //delete failed file
                    fs.unlink(dataPath, function(err){
                        err && logger.warning('config_cache delete failed' + err.message);
                    });
                    cb && cb (e);
                    me.emit('normalize:fail');
                    me.running = false;
                }
            });
            me.emit('update:end');
            fs.write(fd, JSON.stringify(conf),0 , 'utf-8', function(err){
                err && logger.warning('config_cache write failed ' + err.message);
                me.checkResult(cb);
                fs.close(fd, function(err){
                    err && logger.warning('config_cache close failed' + err.message);
                });
            });
        }
    });
};

var updater = new Updater();

module.exports = updater;