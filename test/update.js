/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/20
 */

/* eslint-disable no-wrap-func */

'use strict';

var config = require('../lib/config.js');
var path = require('path');
var fs = require('fs');
var RalModule = require('../lib/ralmodule.js');
var configUpdater = require('../lib/config/configUpdater.js');
var normalizeManager = require('../lib/config.js').normalizerManager;

RalModule.load(path.join(__dirname, '../lib/ext'));

describe('config updater', function () {

    it('update config successful', function (done) {
        config.load(path.join(__dirname, './update/config'));
        configUpdater.update(function (err, conf) {
            conf.SIMPLE.__from__.should.be.startWith('updater');
            done();
        }, true);
    });

    it('can\'t run update twice at same time', function (done) {
        config.load(path.join(__dirname, './update/config'));
        configUpdater.update(function (err, conf) {}, true);
        configUpdater.update(function (err, conf) {
            err.should.be.match(/updater still running/);
            done();
        }, true);
    });

    it('updater will create cache folder on start', function () {
        var tmpPath = path.join(__dirname, './tmp');
        var filePath = path.join(__dirname, './tmp/data_cache.json');
        try {
            fs.unlinkSync(filePath);
            fs.rmdirSync(tmpPath);
        }
        catch (e) {}
        var myUpdater = new configUpdater.Updater({
            tmpPath: tmpPath,
            dataPath: filePath
        });
        myUpdater.should.be.ok;
        fs.existsSync(tmpPath).should.be.true;
    });

    it('updater will delete cache file on start', function () {
        var tmpPath = path.join(__dirname, './tmp');
        var filePath = path.join(__dirname, './tmp/data_cache.json');
        try {
            if (!fs.existsSync(tmpPath)) {
                fs.mkdirSync(tmpPath);
            }
            var fd = fs.openSync(filePath, 'w');
            fs.closeSync(fd);
        }
        catch (e) {}
        fs.existsSync(filePath).should.be.true;
        var myUpdater = new configUpdater.Updater({
            tmpPath: tmpPath,
            dataPath: filePath
        });
        myUpdater.should.be.ok;
        fs.existsSync(filePath).should.be.false;
    });

    it('updater will fail when normlizer throw error', function (done) {
        var tmpPath = path.join(__dirname, './tmp');
        var filePath = path.join(__dirname, './tmp/data_cache.json');
        config.load(path.join(__dirname, './update/config'));
        var fake = {
            normalizeConfig: function () {
                throw new Error('fake');
            }
        };
        var myUpdater = new configUpdater.Updater({
            tmpPath: tmpPath,
            dataPath: filePath
        });
        normalizeManager.setConfigNormalizer([fake]);
        myUpdater.update(function (err) {
            normalizeManager.setConfigNormalizer('default');
            err.message.should.be.match(/fake/);
            done();
        }, true);
    });

    (process.env.CI ? it : it.skip)('update configs of shared object successful', function (done) {
        var fake = {
            normalizeConfig: function (conf) {
                return conf;
            },
            needUpdate: function () {
                return true;
            }
        };
        normalizeManager.setConfigNormalizer([fake, 'default']);
        config.load(path.join(__dirname, './update/config'));
        config.enableUpdate(300000, true);
        // read:succ事件在config更新之后才触发
        configUpdater.once('read:succ', function () {
            config.disableUpdate();
            config.getConfNames().map(function (serviceID) {
                var conf = config.getConf(serviceID);
                conf.__from__.should.be.startWith('updater');
            });
            done();
        });
    });

    (process.env.CI ? it : it.skip)('auto updater should be triggered when normalizer need update', function (done) {
        var fake = {
            normalizeConfig: function (conf) {
                return conf;
            },
            needUpdate: function () {
                return true;
            }
        };
        normalizeManager.setConfigNormalizer([fake, 'default']);
        config.load(path.join(__dirname, './update/config'));
        setTimeout(function () {
            config.isAutoUpdateEnabled().should.be.true;
            config.disableUpdate();
            config.isAutoUpdateEnabled().should.be.false;
            normalizeManager.setConfigNormalizer(['default']);
            done();
        }, 60 * 1000);
    });

    (process.env.CI ? it : it.skip)('auto updater should work fine 1', function (done) {
        var fake = {
            normalizeConfig: function (conf) {
                return conf;
            },
            needUpdate: function () {
                return false;
            }
        };
        normalizeManager.setConfigNormalizer([fake, 'default']);
        config.load(path.join(__dirname, './update/config'));
        // delete config cache produced by previous tests
        var filePath = path.join(__dirname, '../tmp/config_cache.json');
        try {
            fs.unlinkSync(filePath);
        }
        catch (e) {}
        config.enableUpdate(100, false, function (err, confs) {
            confs.should.be.eql({});
            config.disableUpdate();
            normalizeManager.setConfigNormalizer(['default']);
            done();
        });
    });

    (process.env.CI ? it : it.skip)('auto updater should work fine 2', function (done) {
        var fake = {
            normalizeConfig: function (conf) {
                return conf;
            },
            needUpdate: function () {
                // need update
                return true;
            }
        };
        normalizeManager.setConfigNormalizer([fake, 'default']);
        config.load(path.join(__dirname, './update/config'));
        // delete config cache produced by previous tests
        var filePath = path.join(__dirname, '../tmp/config_cache.json');
        try {
            fs.unlinkSync(filePath);
        }
        catch (e) {}
        config.enableUpdate(100, false, function (err, confs) {
            confs.SIMPLE.__from__.should.be.match(/updater/);
            config.disableUpdate();
            normalizeManager.setConfigNormalizer(['default']);
            done();
        });
    });

    (process.env.CI ? it : it.skip)('auto updater should not change raw conf', function (done) {
        var fake = {
            normalizeConfig: function (conf) {
                conf._TEST_RAW_CONF_ = true;
                return conf;
            },
            needUpdate: function () {
                // need update
                return true;
            }
        };
        normalizeManager.setConfigNormalizer([fake, 'default']);
        config.load(path.join(__dirname, './update/config'));
        // delete config cache produced by previous tests
        var filePath = path.join(__dirname, '../tmp/config_cache.json');
        try {
            fs.unlinkSync(filePath);
        }
        catch (e) {}
        config.enableUpdate(100, false, function (err, confs) {
            confs.SIMPLE.__from__.should.be.match(/updater/);
            confs.SIMPLE._TEST_RAW_CONF_.should.be.equal(true);
            // add raw conf check
            (config.getUpdateNeededRawConf().SIMPLE._TEST_RAW_CONF_ === undefined).should.be.true;
            (config.getRawConf().SIMPLE._TEST_RAW_CONF_ === undefined).should.be.true;
            config.disableUpdate();
            normalizeManager.setConfigNormalizer(['default']);
            done();
        });
    });
});
