'use strict';

var should = require('should');
var config = require('../lib/config.js');
var path = require('path');
var RalModule = require('../lib/ralmodule.js');
var ctx = require('../lib/ctx.js');

RalModule.load(__dirname + path.sep + '../lib/ext');

describe('config loadRawConfr', function() {

    it('loadRawConf right config', function() {
        var right_conf = require('./config/right_config.js');
        (function(){config.loadRawConf(right_conf);}).should.not.throw();
    });

    it('loadRawConf config without balance', function() {
        var wrong_conf = require('./config/wrong_config.js').without_balance;
        (function(){config.loadRawConf(wrong_conf);}).should.throw(/balance/);
    });

//    it('loadRawConf config without unpack', function() {
//        var wrong_conf = require('./config/wrong_config.js').without_unpack;
//        (function(){config.loadRawConf(wrong_conf);}).should.throw(/unpack/);
//    });
//
//    it('loadRawConf config without pack', function() {
//        var wrong_conf = require('./config/wrong_config.js').without_pack;
//        (function(){config.loadRawConf(wrong_conf);}).should.throw(/pack/);
//    });

    it('loadRawConf config without protocol', function() {
        var wrong_conf = require('./config/wrong_config.js').without_protocol;
        (function(){config.loadRawConf(wrong_conf);}).should.throw(/protocol/);
    });

    it('loadRawConf config with invalid encoding', function() {
        var wrong_conf = require('./config/wrong_config.js').with_invalid_encoding;
        (function(){config.loadRawConf(wrong_conf);}).should.throw(/encoding is valid/);
    });

    it('loadRawConf config with out server', function() {
        var wrong_conf = require('./config/wrong_config.js').without_server;
        (function(){config.loadRawConf(wrong_conf);}).should.throw(/server/);
    });

    it('loadRawConf config with out server info', function() {
        var wrong_conf = require('./config/wrong_config.js').without_server_info;
        (function(){config.loadRawConf(wrong_conf);}).should.throw(/server/);
    });

    it('loadRawConf config with out port', function() {
        var wrong_conf = require('./config/wrong_config.js').without_port;
        (function(){config.loadRawConf(wrong_conf);}).should.throw(/port/);
    });

    it('loadRawConf config with invalid pack', function() {
        var wrong_conf = require('./config/wrong_config.js').with_invalid_pack;
        (function(){config.loadRawConf(wrong_conf);}).should.throw(/invalid pack/);
    });
});

describe('load config', function() {

    it('load by file', function() {
        var conf = config.load(__dirname + path.sep + './config/single_config.js');
        conf.should.have.properties('bookService', 'bookServiceBNS', 'bookListService', 'bookListServiceWithCUI');
    });

    it('load by json', function() {
        var conf = config.load(__dirname + path.sep + './config/json_config.json');
        conf.should.have.properties('bookService');
    });

    it('load by wrong file path', function() {
        (function(){config.load(__dirname + path.sep + './config/single_config_w.js');}).should.throwError();
    });

    it('load by wrong folder path', function() {
        (function(){config.load(__dirname + path.sep + './config/directory_w');}).should.throwError();
    });

    it('load by directory', function() {
        var conf = config.load(__dirname + path.sep + './config/directory');
        var confs = config.getConfNames();
        confs.should.containEql('bookService', 'bookServiceBNS', 'bookListService', 'bookListServiceWithCUI');
        ctx.currentIDC.should.be.equal('tc');
    });
});