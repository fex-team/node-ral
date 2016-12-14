/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/5
 */

/* eslint-disable no-wrap-func */

'use strict';

var should = require('should');
var config = require('../lib/config.js');
var path = require('path');
var RalModule = require('../lib/ralmodule.js');
var ctx = require('../lib/ctx.js');

RalModule.load(path.join(__dirname, '../lib/ext'));

describe('config loadRawConfr', function () {

    it('loadRawConf right config', function () {
        var rightConf = require('./config/right_config.js');
        (function () {
            config.loadRawConf(rightConf);
        }).should.not.throw();
    });

    it('loadRawConf config without balance', function () {
        var wrongConf = require('./config/wrong_config.js').without_balance;
        var conf = config.loadRawConf(wrongConf);
        conf.bookServiceBNS._isValid.should.be.false;
        conf.bookServiceBNS._validateFailInfo.should.match(/balance/);
    });

    //    it('loadRawConf config without unpack', function() {
    //        var wrongConf = require('./config/wrong_config.js').withoutUnpack;
    //        (function(){config.loadRawConf(wrongConf);}).should.throw(/unpack/);
    //    });
    //
    //    it('loadRawConf config without pack', function() {
    //        var wrongConf = require('./config/wrong_config.js').withoutPack;
    //        (function(){config.loadRawConf(wrongConf);}).should.throw(/pack/);
    //    });

    it('loadRawConf config without protocol', function () {
        var wrongConf = require('./config/wrong_config.js').withoutProtocol;
        var conf = config.loadRawConf(wrongConf);
        conf.bookServiceBNS._isValid.should.be.false;
        conf.bookServiceBNS._validateFailInfo.should.match(/protocol/);
    });

    it('loadRawConf config with invalid encoding', function () {
        var wrongConf = require('./config/wrong_config.js').withInvalidEncoding;
        var conf = config.loadRawConf(wrongConf);
        conf.bookServiceBNS._isValid.should.be.false;
        conf.bookServiceBNS._validateFailInfo.should.match(/encoding is invalid/);
    });

    it('loadRawConf config with out server', function () {
        var wrongConf = require('./config/wrong_config.js').withoutServer;
        var conf = config.loadRawConf(wrongConf);
        conf.bookServiceBNS._isValid.should.be.false;
        conf.bookServiceBNS._validateFailInfo.should.match(/server/);
    });

    it('loadRawConf config with out server info', function () {
        var wrongConf = require('./config/wrong_config.js').withoutServerInfo;
        var conf = config.loadRawConf(wrongConf);
        conf.bookServiceBNS._isValid.should.be.false;
        conf.bookServiceBNS._validateFailInfo.should.match(/server/);
    });

    it('loadRawConf config with out port', function () {
        var wrongConf = require('./config/wrong_config.js').withoutPort;
        var conf = config.loadRawConf(wrongConf);
        conf.bookServiceBNS.server[0].port.should.be.equal(80);
    });

    it('loadRawConf config with invalid pack', function () {
        var wrongConf = require('./config/wrong_config.js').withInvalidPack;
        var conf = config.loadRawConf(wrongConf);
        conf.bookServiceBNS._isValid.should.be.false;
        conf.bookServiceBNS._validateFailInfo.should.match(/invalid pack/);
    });

    it('loadRawConf config with portOffset', function () {
        var rightConf = require('./config/right_config.js');
        var conf = config.loadRawConf(rightConf);
        conf.withPortOffset.server[0].port.should.be.equal(90);
        conf.withPortOffset.server[1].port.should.be.equal(80);
    });
});

describe('load config', function () {

    it('load by file', function () {
        var conf = config.load(path.join(__dirname, './config/single_config.js'));
        conf.should.have.properties('bookService', 'bookServiceBNS', 'bookListService',
            'bookListServiceWithCUI');
    });

    it('load by json', function () {
        var conf = config.load(path.join(__dirname, './config/json_config.json'));
        conf.should.have.properties('bookService');
    });

    it('load by wrong file path', function () {
        (function () {
            config.load(path.join(__dirname, './config/single_config_w.js'));
        }).should.throwError();
    });

    it('load by wrong folder path', function () {
        (function () {
            config.load(path.join(__dirname, './config/directory_w'));
        }).should.throwError();
    });

    it('load by directory', function () {
        config.load(path.join(__dirname, './config/directory'));
        var confs = config.getConfNames();
        confs.should.containEql('bookService', 'bookServiceBNS', 'bookListService', 'bookListServiceWithCUI');
        ctx.currentIDC.should.be.equal('tc');
    });

    it('load with env undefined', function () {
        config.clearConf();
        var origin = ctx.env;
        ctx.env = undefined;
        config.load(path.join(__dirname, './config/envconfig'));
        ctx.env = origin;
        config.getRawConf().should.have.keys('a', 'b', 'c', 'd', 'e', 'g', 'h');
        config.getConf('a').query.name.should.equal('normal');
        config.getConf('b').query.name.should.equal('normal');
        config.getConf('c').query.name.should.equal('default');
        config.getConf('d').query.name.should.equal('normal');
        config.getConf('e').query.name.should.equal('normal');
        config.getConf('g').query.name.should.equal('default');
        config.getConf('h').query.name.should.equal('normal');
    });

    it('load with env prod', function () {
        config.clearConf();
        var origin = ctx.env;
        ctx.env = 'prod';
        config.load(path.join(__dirname, './config/envconfig'));
        ctx.env = origin;
        config.getRawConf().should.have.keys('a', 'b', 'c', 'd', 'e', 'g', 'h');
        config.getConf('a').query.name.should.equal('normal');
        config.getConf('b').query.name.should.equal('normal');
        config.getConf('c').query.name.should.equal('default');
        config.getConf('d').query.name.should.equal('normal');
        config.getConf('e').query.name.should.equal('prod');
        config.getConf('g').query.name.should.equal('default');
        config.getConf('h').query.name.should.equal('prod');
    });

    it('load with env kk', function () {
        config.clearConf();
        var origin = ctx.env;
        ctx.env = 'kk';
        config.load(path.join(__dirname, './config/envconfig'));
        ctx.env = origin;
        config.getRawConf().should.have.keys('a', 'b', 'c', 'd', 'e', 'g', 'h');
        config.getConf('a').query.name.should.equal('kk');
        config.getConf('b').query.name.should.equal('normal');
        config.getConf('c').query.name.should.equal('default');
        config.getConf('d').query.name.should.equal('normal');
        config.getConf('e').query.name.should.equal('normal');
        config.getConf('g').query.name.should.equal('default');
        config.getConf('h').query.name.should.equal('normal');
    });


    it('load with env dev', function () {
        config.clearConf();
        var origin = ctx.env;
        ctx.env = 'dev';
        config.load(path.join(__dirname, './config/envconfig'));
        ctx.env = origin;
        config.getRawConf().should.have.keys('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h');
        config.getConf('a').query.name.should.equal('dev');
        config.getConf('b').query.name.should.equal('normal');
        config.getConf('c').query.name.should.equal('default');
        config.getConf('d').query.name.should.equal('normal');
        config.getConf('e').query.name.should.equal('normal');
        config.getConf('f').query.name.should.equal('dev');
        config.getConf('g').query.name.should.equal('dev');
        config.getConf('h').query.name.should.equal('dev');
    });

    it('parse customLog', function () {
        config.clearConf();
        config.load(path.join(__dirname, './config/customLogConfig'));
        config.getConf('CUSTOM_LOG').customLog.length.should.equal(3);
        config.getConf('CUSTOM_LOG').customLog[0].key.should.equal('tracecode');
        config.getConf('CUSTOM_LOG').customLog[1].key.should.equal('logid');
        config.getConf('CUSTOM_LOG').customLog[0].param.length.should.equal(4);
        config.getConf('CUSTOM_LOG').customLog[0].param[0].should.equal("responseContext");
        config.getConf('CUSTOM_LOG').customLog[0].param[1].should.equal("extras");
        config.getConf('CUSTOM_LOG').customLog[0].param[2].should.equal("headers");
        config.getConf('CUSTOM_LOG').customLog[0].param[3].should.equal("tracecode");
    });

});
