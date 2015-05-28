/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/20
 *
 */

/* eslint-disable no-console */

'use strict';

var config = require('../../lib/config.js');
var path = require('path');
var RalModule = require('../../lib/ralmodule.js');
var configUpdater = require('../../lib/config/configUpdater.js');
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    console.log('master start...');
    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
}
else {
    RalModule.load(path(__dirname, '../../lib/ext'));

    config.load(path(__dirname, '../update/config'));

    console.log('cluster:', cluster.worker.id.toString(), 'config come from', config.getConf('SIMPLE').__from__);

    configUpdater.on('read:fail', function () {
        console.log('cluster:', cluster.worker.id.toString(), 'read fail');
    });
    configUpdater.on('read:succ', function () {
        console.log('cluster:', cluster.worker.id.toString(), 'read succ');
        console.log('cluster:', cluster.worker.id.toString(), 'config come from', config.getConf('SIMPLE').__from__);
    });
    configUpdater.on('read:error', function () {
        console.log('cluster:', cluster.worker.id.toString(), 'read error');
    });
    configUpdater.on('wait', function () {
        console.log('cluster:', cluster.worker.id.toString(), 'wait');
    });
    configUpdater.on('update:start', function () {
        console.log('cluster:', cluster.worker.id.toString(), 'update start');
    });
    configUpdater.on('update:end', function () {
        console.log('cluster:', cluster.worker.id.toString(), 'update end');
    });

    config.enableUpdate(8000, true);
}
