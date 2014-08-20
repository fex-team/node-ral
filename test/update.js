/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/20
 */

'use strict';

var config = require('../lib/config.js');
var path = require('path');
var RalModule = require('../lib/ralmodule.js');
var configUpdater = require('../lib/config/configUpdater.js');

RalModule.load(__dirname + path.sep + '../lib/ext');

describe('config updater', function() {

    it('update config successful', function (done) {
        config.load(__dirname + path.sep + './update/config');
        configUpdater.update(function(err, conf){
            conf.SIMPLE.__from__.should.be.startWith('updater');
            done();
        }, true);
    });
});