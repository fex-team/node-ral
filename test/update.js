/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/20
 */

'use strict';

var config = require('../lib/config.js');
var path = require('path');
var fs = require('fs');
var RalModule = require('../lib/ralmodule.js');
var CTX = require('../lib/ctx.js');
var configUpdater = require('../lib/config/configUpdater.js');
var normalizeManager = require('../lib/config.js').normalizerManager;

RalModule.load(__dirname + path.sep + '../lib/ext');

describe('config updater', function() {

    it('update config successful', function (done) {
        config.load(__dirname + path.sep + './update/config');
        configUpdater.update(function(err, conf){
            conf.SIMPLE.__from__.should.be.startWith('updater');
            done();
        }, true);
    });

    it('can\'t run update twice at same time', function (done) {
        config.load(__dirname + path.sep + './update/config');
        configUpdater.update(function(err, conf){
        }, true);
        configUpdater.update(function(err, conf){
            err.should.be.match(/updater still running/);
            done();
        }, true);
    });

    it('updater will create cache folder on start', function(){
        var tmpPath = __dirname + path.sep + './tmp';
        var filePath = __dirname + path.sep + './tmp/data_cache.json';
        try{
            fs.unlinkSync(filePath);
            fs.rmdirSync(tmpPath);
        }catch(e){

        }
        var myUpdater = new configUpdater.Updater({
            tmpPath: tmpPath,
            dataPath: filePath
        });
        fs.existsSync(tmpPath).should.be.true;
    });

    it('updater will delete cache file on start', function(){
        var tmpPath = __dirname + path.sep + './tmp';
        var filePath = __dirname + path.sep + './tmp/data_cache.json';
        try{
            if (!fs.existsSync(tmpPath)){
                fs.mkdirSync(tmpPath);
            }
            var fd = fs.openSync(filePath, 'w');
            fs.closeSync(fd);
        }catch(e){
        }
        fs.existsSync(filePath).should.be.true;
        var myUpdater = new configUpdater.Updater({
            tmpPath: tmpPath,
            dataPath: filePath
        });
        fs.existsSync(filePath).should.be.false;
    });

    it('updater will fail when normlizer throw error', function(done){
        var tmpPath = __dirname + path.sep + './tmp';
        var filePath = __dirname + path.sep + './tmp/data_cache.json';
        config.load(__dirname + path.sep + './update/config');
        var fake = {
            normalizeConfig: function() {
                throw new Error('fake');
            }
        };
        var myUpdater = new configUpdater.Updater({
            tmpPath: tmpPath,
            dataPath: filePath
        });
        normalizeManager.setConfigNormalizer([fake]);
        myUpdater.update(function(err){
            normalizeManager.setConfigNormalizer('default');
            err.message.should.be.match(/fake/);
            done();
        }, true);
    });

    it('auto updater should be triggered is normalizer need update', function(){
        var fake = {
            normalizeConfig: function(config) {
                return config;
            },
            needUpdate: function(){
                return true;
            }
        };
        normalizeManager.setConfigNormalizer([fake,'default']);
        config.load(__dirname + path.sep + './update/config');
        config.isAutoUpdateEnabled().should.be.true;
        config.disableUpdate();
        config.isAutoUpdateEnabled().should.be.false;
        normalizeManager.setConfigNormalizer(['default']);
    });

    it('auto updater should work fine 1', function(done){
        var fake = {
            normalizeConfig: function(config) {
                return config;
            },
            needUpdate: function(){
                return false;
            }
        };
        normalizeManager.setConfigNormalizer([fake,'default']);
        config.load(__dirname + path.sep + './update/config');
        //delete config cache produced by previous tests
        var filePath = __dirname + path.sep + '../tmp/config_cache.json';
        try{
            fs.unlinkSync(filePath);
        }catch(e){}
        config.enableUpdate(100, false, function(err, confs){
            confs.should.be.eql({});
            config.disableUpdate();
            normalizeManager.setConfigNormalizer(['default']);
            done();
        });
    });

    it('auto updater should work fine 2', function(done){
        var fake = {
            normalizeConfig: function(config) {
                return config;
            },
            needUpdate: function(){
                //need update
                return true;
            }
        };
        normalizeManager.setConfigNormalizer([fake,'default']);
        config.load(__dirname + path.sep + './update/config');
        //delete config cache produced by previous tests
        var filePath = __dirname + path.sep + '../tmp/config_cache.json';
        try{
            fs.unlinkSync(filePath);
        }catch(e){}
        config.enableUpdate(100, false, function(err, confs){
            confs.SIMPLE.__from__.should.be.match(/updater/);
            config.disableUpdate();
            normalizeManager.setConfigNormalizer(['default']);
            done();
        });
    });
});