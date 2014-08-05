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
var Balance = balance.Balance;
var RandomBalance = require('../lib/ext/balance/random.js');
var RoundRobinBalance = require('../lib/ext/balance/roundrobin.js');
var SourceRandom = Math.random;

describe('balance', function(){
    it('should fail when get name', function(){
        var balance = new Balance();
        (function(){balance.getName();}).should.be.throw(/Not Implemented/);
    });

    it('should get context class', function(){
        var balance = new Balance();
        balance.getContext().should.be.equal(BalanceContext);
    });
});


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

    it('service conf with hybird mode can use all server', function(done) {
        config.load(__dirname + path.sep + './config/idc_config.js', function(err, conf){
            ctx.currentIDC = 'st';
            var context = new BalanceContext('bookService3', conf.bookService3);
            context.reqIDCServers.should.eql(conf.bookService3.server);
            done();
        });
    });
});

describe('random balance', function() {
    it('has right name', function(){
        var balance = new RandomBalance();
        balance.getName().should.be.equal('random');
    });


    it('has right context class', function(){
        var converter = new RandomBalance();
        converter.getContext().should.be.equal(BalanceContext);
    });

    it('get server by random', function(done) {
        config.load(__dirname + path.sep + './config/idc_config.js', function(err, conf){
            ctx.currentIDC = 'tc';
            var context = new BalanceContext('bookService3', conf.bookService3);
            var balance = new RandomBalance();
            Math.random = function(){
                return 0.1;
            };
            var server = balance.fetchServer(context);
            Math.random = SourceRandom;
            server.should.be.eql(conf.bookService3.server[0]);
            done();
        });
    });

    it('get server by random', function(done) {
        config.load(__dirname + path.sep + './config/idc_config.js', function(err, conf){
            ctx.currentIDC = 'tc';
            var context = new BalanceContext('bookService3', conf.bookService3);
            var balance = new RandomBalance();
            var server = balance.fetchServer(context);
            conf.bookService3.server.should.be.containEql(server);
            done();
        });
    });

    it('direct use single server', function(done) {
        config.load(__dirname + path.sep + './config/singleserver_config.js', function(err, conf){
            ctx.currentIDC = 'st';
            var context = new BalanceContext('bookService', conf.bookService);
            var balance = new RandomBalance();
            Math.random = function(){
                throw new Error();
            };
            (function(){balance.fetchServer(context);}).should.not.throwError();
            var server = balance.fetchServer(context);
            Math.random = SourceRandom;
            server.should.be.eql(conf.bookService.server[0]);
            done();
        });
    });
});

describe('roundrobin balance', function() {
    it('has right name', function(){
        var balance = new RoundRobinBalance();
        balance.getName().should.be.equal('roundrobin');
    });

    it('has right context class', function(){
        var converter = new RoundRobinBalance();
        converter.getContext().should.be.equal(BalanceContext);
    });

    it('get server by roundrobin', function(done) {
        config.load(__dirname + path.sep + './config/idc_config.js', function(err, conf){
            var context = new BalanceContext('bookService3', conf.bookService3);
            var balance = new RoundRobinBalance();
            var server = balance.fetchServer(context);
            server.should.be.eql(conf.bookService3.server[1]);
            server = balance.fetchServer(context);
            server.should.be.eql(conf.bookService3.server[0]);
            server = balance.fetchServer(context);
            server.should.be.eql(conf.bookService3.server[1]);
            done();
        });
    });

    it('direct use single server', function(done) {
        config.load(__dirname + path.sep + './config/singleserver_config.js', function(err, conf){
            ctx.currentIDC = 'tc';
            var context = new BalanceContext('bookService', conf.bookService);
            var balance = new RoundRobinBalance();
            var server = balance.fetchServer(context);
            server.should.be.eql(conf.bookService.server[0]);
            (context.lastRoundRobinID === undefined).should.be.true;
            done();
        });
    });
});