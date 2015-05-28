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
        (function () {
            config.loadRawConf(wrongConf);
        }).should.throw(/balance/);
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
        (function () {
            config.loadRawConf(wrongConf);
        }).should.throw(/protocol/);
    });

    it('loadRawConf config with invalid encoding', function () {
        var wrongConf = require('./config/wrong_config.js').withInvalidEncoding;
        (function () {
            config.loadRawConf(wrongConf);
        }).should.throw(/encoding is valid/);
    });

    it('loadRawConf config with out server', function () {
        var wrongConf = require('./config/wrong_config.js').withoutServer;
        (function () {
            config.loadRawConf(wrongConf);
        }).should.throw(/server/);
    });

    it('loadRawConf config with out server info', function () {
        var wrongConf = require('./config/wrong_config.js').withoutServerInfo;
        (function () {
            config.loadRawConf(wrongConf);
        }).should.throw(/server/);
    });

    it('loadRawConf config with out port', function () {
        var wrongConf = require('./config/wrong_config.js').withoutPort;
        (function () {
            config.loadRawConf(wrongConf);
        }).should.throw(/port/);
    });

    it('loadRawConf config with invalid pack', function () {
        var wrongConf = require('./config/wrong_config.js').withInvalidPack;
        (function () {
            config.loadRawConf(wrongConf);
        }).should.throw(/invalid pack/);
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
});
