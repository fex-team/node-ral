'use strict';

var should = require('should');
var config = require('../lib/config.js');
var path = require('path');

describe('config parser', function() {

    it('parse right config', function() {
        var right_conf = require('./config/right_config.js');
        (function(){config.parse(right_conf);}).should.not.throw();
    });

    it('parse config without balance', function() {
        var wrong_conf = require('./config/wrong_config.js').without_balance;
        (function(){config.parse(wrong_conf);}).should.throw(/balance/);
    });

//    it('parse config without unpack', function() {
//        var wrong_conf = require('./config/wrong_config.js').without_unpack;
//        (function(){config.parse(wrong_conf);}).should.throw(/unpack/);
//    });
//
//    it('parse config without pack', function() {
//        var wrong_conf = require('./config/wrong_config.js').without_pack;
//        (function(){config.parse(wrong_conf);}).should.throw(/pack/);
//    });

    it('parse config without protocol', function() {
        var wrong_conf = require('./config/wrong_config.js').without_protocol;
        (function(){config.parse(wrong_conf);}).should.throw(/protocol/);
    });

    it('parse config with invalid encoding', function() {
        var wrong_conf = require('./config/wrong_config.js').with_invalid_encoding;
        (function(){config.parse(wrong_conf);}).should.throw(/encoding is valid/);
    });

    it('parse config with out server', function() {
        var wrong_conf = require('./config/wrong_config.js').without_server;
        (function(){config.parse(wrong_conf);}).should.throw(/server/);
    });

    it('parse config with out server info', function() {
        var wrong_conf = require('./config/wrong_config.js').without_server_info;
        (function(){config.parse(wrong_conf);}).should.throw(/server/);
    });

    it('parse config with out port', function() {
        var wrong_conf = require('./config/wrong_config.js').without_port;
        (function(){config.parse(wrong_conf);}).should.throw(/port/);
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
    });
});