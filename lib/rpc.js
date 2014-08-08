/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/7
 */

'use strict';
var util = require('./util.js'),
    ctx = require('./ctx.js'),
    loggerGen = require('./logger.js'),
    logger = require('./logger.js')('RPC'),
    config = require('./config.js'),
    RalModule = require('./ralmodule.js'),
    async = require('async'),
    iconv = require('iconv-lite'),
    path = require('path');

iconv.extendNodeEncodings();

function RPC(serviceName){
    var conf = config.getConf(serviceName);
    var context = convertConfToContext(conf);
    var balanceContext = new context.balance.BalanceContext(conf);
    var server = context.balance.fetchServer(balanceContext);
    console.log(server);
}

function convertConfToContext(conf){
    conf.unpack = RalModule.modules.converter[conf.unpack];
    conf.pack = RalModule.modules.converter[conf.pack];
    conf.protocol = RalModule.modules.protocol[conf.protocol];
    conf.balance =  RalModule.modules.balance[conf.balance];
    return conf;
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

RPC.init = function(options, callback){
    options = util.merge(defaultOptions, options);
    ctx.currentIDC = options.currentIDC;
    loggerGen.options = options.logger;
    var loadTask = [];
    if (options.confDir){
        loadTask.push(function(cb){config.load(options.confDir,cb);});
    }
    if (options.extDir){
        options.extDir.forEach(function(dir){
            loadTask.push(function(cb){RalModule.load(dir,cb);});
        });
    }
    async.parallel(loadTask, function(err){
        if (err){
            logger.fatal('yog-ral init fail' + err.message);
            callback && callback(err);
        }
        callback && callback();
    });

};

module.exports = RPC;