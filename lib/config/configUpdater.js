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
var clusterID = (cluster.isWorker ? 'cluster: ' + cluster.isWorker.id : '');
/**
 * Config Updater
 *
 * used to update config with ConfigNormalizer
 * @constructor
 */
function Updater(){
    EventEmitter.call(this);
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
}

util.inherits(Updater, EventEmitter);

Updater.prototype.checkResult = function(cb){
    var me = this;
    function _check(){
        fs.readFile(dataPath, function(err, data){
            if (err){
                clearInterval(task);
                me.emit('read:error');
                logger.fatal(clusterID + 'read config_cache failed');
                cb && cb(err);
                return;
            }
            var content = data.toString();
            if (content){
                clearInterval(task);
                var config = JSON.parse(content);
                setTimeout(function(){
                    fs.unlink(dataPath, function(err){
                    });
                },3000);
                cb && cb(null, config);
                logger.trace(clusterID + 'read config_cache succ');
                me.emit('read:succ');
            }else{
                logger.trace(clusterID + 'waiting config_cache');
                me.emit('read:fail');
            }
        });
    }
    var task = setInterval(_check, 1000);
};

Updater.prototype.update = function(cb, all){
    var me = this;
    //create a file to share update result between cluster
    fs.open(dataPath, 'wx', function(err, fd){
        if (err){
            me.emit('wait');
            me.checkResult(cb);
        }else{
            logger.trace(clusterID + 'config normalize start');
            me.emit('update:start');
            var conf = all? config.getRawConf() : config.getUpdateNeededRawConf();
            _.map(conf, function(value, key){
                try{
                    conf[key] = config.normalize(value);
                    //add a conf from tag
                    conf[key].__from__ = 'updater_' + (new Date()).getTime();
                }catch(e){
                    logger.fatal(clusterID + 'config normalize failed');
                    fs.close(fd);
                    //delete failed file
                    fs.unlink(dataPath, function(err){
                    });
                    cb && cb (e);
                    me.emit('normalize:fail');
                }
            });
            me.emit('update:end');
            fs.write(fd, JSON.stringify(conf),0 , 'utf-8', function(err){
                err && logger.warning(clusterID + 'config_cache write failed ' + err.message);
                me.checkResult(cb);
                fs.close(fd, function(err){
                    err && logger.warning(clusterID + 'config_cache close failed' + err.message);
                });
            });
        }
    });
};

var updater = new Updater();

module.exports = updater;