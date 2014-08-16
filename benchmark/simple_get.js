/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/16
 */

'use strict';

var RAL = require('./init.js');
var async = require('async');
var request = require('request');
var http = require('http');
var now = require('performance-now');


//wait fork server start
setTimeout(function(){
    //preload
    var preload  = RAL('SIMPLE_GET');
    preload.on('data', function(){
        var tasks = [
            function(cb){startBenchmark('ral', ralRequest, cb);},
//            function(cb){startBenchmark('request', requestRequest, cb);},
            function(cb){startBenchmark('http', httpRequest, cb);}
        ];
        async.series(tasks, function(){
            RAL.end();
        });
    });
},500);

var count = 8000;

function startBenchmark(name, func, callback){
    var tasks = [];
    for(var i=0; i< count; i++){
        tasks.push(func);
    }
    var start = now();
    async.parallelLimit(tasks,500, function(err,results){
        var end = now();
        var failCount = 0;
        var succCount = 0;
        var lastErr;
        results.forEach(function(err){
           if (err){
               lastErr = err;
               failCount++;
           }
           else{
               succCount++;
           }
        });
        console.log(name, 'avg:', ((end-start)/count).toFixed(3), 'ms ', 'succ:', succCount, 'failed:', failCount, 'lastError:', lastErr);
        callback();
    });
}

function ralRequest(callback){
    var req = RAL('SIMPLE_GET');
    req.on('data', function(){
        callback(null);
    });
    req.on('error', function(err){
        callback(null, err);
    });
}

function requestRequest(callback){
    var options = {
        url : 'http://127.0.0.1:8192',
        path: '/',
        method: 'GET',
        pool: false
    };

    var req = request(options, function(err){
        callback(null, err);
    });
}

function httpRequest(callback){
    var options = {
        host : '127.0.0.1',
        path: '/',
        port: 8192,
        method: 'GET',
        agent: false
    };

    var req = http.request(options, function(res){
        req.on('close', function(data){
            callback(null);
        });
    });
    req.on('error', function(err){
        callback(null, err);
    });
    req.end();
}
