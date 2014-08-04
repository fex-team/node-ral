/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/4
 */

'use strict';

var should = require('should');
var balance = require('../lib/balance.js');
var config = require('../lib/config.js');
var path = require('path');
var ctx = require('../lib/ctx.js');
var BalanceContext = balance.BalanceContext;

describe('balance context', function() {

    it('get server by all idc', function(done) {
        config.load(__dirname + path.sep + './config/idc_config.js', function(err, conf){
            var context = new BalanceContext('bookService', conf.bookService);
            context.reqIDCServers.should.eql(conf.bookService.server);
            done();
        });
    });

    it('get server by tc idc', function(done) {
        config.load(__dirname + path.sep + './config/idc_config.js', function(err, conf){
            ctx.currentIDC = 'tc';
            var context = new BalanceContext('bookService', conf.bookService);
            context.reqIDCServers.should.have.length(1);
            context.reqIDCServers[0].idc.should.equal('tc');
            context.crossIDCServers.should.have.length(1);
            context.crossIDCServers[0].idc.should.equal('st');
            done();
        });
    });

    it('server conf without idc can use for all idc', function(done) {
        config.load(__dirname + path.sep + './config/idc_config.js', function(err, conf){
            ctx.currentIDC = 'tc';
            var context = new BalanceContext('bookService2', conf.bookService2);
            context.reqIDCServers.should.have.length(2);
            context.reqIDCServers.should.eql(conf.bookService2.server);
            done();
        });
    });
});