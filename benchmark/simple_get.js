/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/16
 */

/* eslint-disable no-console */

'use strict';

var ral = require('./init.js');
var async = require('async');
var http = require('http');
var now = require('performance-now');


// wait fork server start
setTimeout(function () {
    // preload
    var preload = ral('SIMPLE_GET');
    preload.on('data', function () {
        var tasks = [

            function (cb) {
                startBenchmark('ral', ralRequest, cb);
            },
            function (cb) {
                startBenchmark('http', httpRequest, cb);
            }
        ];
        async.series(tasks, function () {
            ral.end();
        });
    });
}, 500);

var count = 500;

function startBenchmark(name, func, callback) {
    var tasks = [];
    for (var i = 0; i < count; i++) {
        tasks.push(func);
    }
    var start = now();
    async.series(tasks, function (err, results) {
        var end = now();
        var failCount = 0;
        var succCount = 0;
        var lastErr;
        results.forEach(function (err) {
            if (err) {
                lastErr = err;
                failCount++;
            }
            else {
                succCount++;
            }
        });
        lastErr = lastErr || 'none';
        console.log(name, 'avg:', ((end - start) / count).toFixed(3), 'ms time:', (end - start).toFixed(3), 'ms ',
            'succ:', succCount, 'failed:', failCount, 'lastError:', lastErr);
        callback();
    });
}

function ralRequest(callback) {
    var req = ral('SIMPLE_GET');
    req.on('data', function () {
        callback(null);
    });
    req.on('error', function (err) {
        callback(null, err);
    });
}

function httpRequest(callback) {
    var options = {
        host: '127.0.0.1',
        path: '/',
        port: 8192,
        method: 'GET',
        agent: false
    };

    var req = http.request(options, function (res) {
        if (res.statusCode > 200) {
            callback(null, new Error('503'));
        }
        else {
            req.on('close', function (data) {
                callback(null);
            });
        }
    });
    req.on('error', function (err) {
        callback(null, err);
    });
    req.end();
}
