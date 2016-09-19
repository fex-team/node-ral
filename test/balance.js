/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/4
 */

/*eslint-env node, mocha */
/* eslint-disable no-wrap-func, max-nested-callbacks */


'use strict';

var should = require('should');
var Balance = require('../lib/balance.js');
var config = require('../lib/config.js');
var path = require('path');
var ctx = require('../lib/ctx.js');
var BalanceContext = Balance.BalanceContext;
var RandomBalance = require('../lib/ext/balance/random.js');
var HashringBalance = require('../lib/ext/balance/hashring.js');
var RoundRobinBalance = require('../lib/ext/balance/roundrobin.js');
var SourceRandom = Math.random;

describe('balance', function () {
    it('should fail when get name', function () {
        var balance = new Balance();
        (function () {
            balance.getName();
        }).should.be.throw(/Not Implemented/);
    });

    it('has right catagory', function () {
        var balance = new Balance();
        balance.getCategory().should.be.equal('balance');
    });

    it('should get context class', function () {
        var balance = new Balance();
        balance.getContextClass().should.be.equal(BalanceContext);
    });
});


describe('balance context', function () {

    it('get server by all idc', function () {
        var conf = config.load(path.join(__dirname, './config/idc_config.js'));
        var context = new BalanceContext('bookService', conf.bookService);
        context.reqIDCServers.should.eql(conf.bookService.server);
    });

    it('get server by tc idc', function () {
        var conf = config.load(path.join(__dirname, './config/idc_config.js'));
        ctx.currentIDC = 'tc';
        var context = new BalanceContext('bookService', conf.bookService);
        context.reqIDCServers.should.have.length(1);
        context.reqIDCServers[0].idc.should.equal('tc');
        context.crossIDCServers.should.have.length(1);
        context.crossIDCServers[0].idc.should.equal('st');
    });

    it('server conf without idc can use for all idc', function () {
        var conf = config.load(path.join(__dirname, './config/idc_config.js'));
        ctx.currentIDC = 'tc';
        var context = new BalanceContext('bookService2', conf.bookService2);
        context.reqIDCServers.should.have.length(2);
        context.reqIDCServers.should.eql(conf.bookService2.server);
    });

    it('service conf with hybird mode can use all server', function () {
        var conf = config.load(path.join(__dirname, './config/idc_config.js'));
        ctx.currentIDC = 'st';
        var context = new BalanceContext('bookService3', conf.bookService3);
        context.reqIDCServers.should.eql(conf.bookService3.server);
    });
});

describe('random balance', function () {
    it('has right name', function () {
        var balance = new RandomBalance();
        balance.getName().should.be.equal('random');
    });

    it('has right catagory', function () {
        var balance = new RandomBalance();
        balance.getCategory().should.be.equal('balance');
    });

    it('has right context class', function () {
        var converter = new RandomBalance();
        converter.getContextClass().should.be.equal(BalanceContext);
    });

    it('get server by random', function () {
        var conf = config.load(path.join(__dirname, './config/idc_config.js'));
        ctx.currentIDC = 'tc';
        var context = new BalanceContext('bookService3', conf.bookService3);
        var balance = new RandomBalance();
        Math.random = function () {
            return 0.1;
        };
        var server = balance.fetchServer(context);
        Math.random = SourceRandom;
        server.should.be.eql(conf.bookService3.server[0]);
    });

    it('get server by random for real random', function () {
        var conf = config.load(path.join(__dirname, './config/idc_config.js'));
        ctx.currentIDC = 'tc';
        var context = new BalanceContext('bookService3', conf.bookService3);
        var balance = new RandomBalance();
        var server = balance.fetchServer(context);
        conf.bookService3.server.should.be.containEql(server);
    });

    it('direct use single server', function () {
        var conf = config.load(path.join(__dirname, './config/singleserver_config.js'));
        ctx.currentIDC = 'st';
        var context = new BalanceContext('bookService', conf.bookService);
        var balance = new RandomBalance();
        Math.random = function () {
            throw new Error();
        };
        (function () {
            balance.fetchServer(context);
        }).should.not.throwError();
        var server = balance.fetchServer(context);
        Math.random = SourceRandom;
        server.should.be.eql(conf.bookService.server[0]);
    });
});

describe('roundrobin balance', function () {
    it('has right name', function () {
        var balance = new RoundRobinBalance();
        balance.getName().should.be.equal('roundrobin');
    });

    it('has right catagory', function () {
        var balance = new RoundRobinBalance();
        balance.getCategory().should.be.equal('balance');
    });

    it('has right context class', function () {
        var converter = new RoundRobinBalance();
        converter.getContextClass().should.be.equal(BalanceContext);
    });

    it('get server by roundrobin', function () {
        var conf = config.load(path.join(__dirname, './config/idc_config.js'));
        var context = new BalanceContext('bookService3', conf.bookService3);
        var balance = new RoundRobinBalance();
        var server = balance.fetchServer(context);
        server.should.be.eql(conf.bookService3.server[1]);
        server = balance.fetchServer(context);
        server.should.be.eql(conf.bookService3.server[0]);
        server = balance.fetchServer(context);
        server.should.be.eql(conf.bookService3.server[1]);
    });

    it('direct use single server', function () {
        var conf = config.load(path.join(__dirname, './config/singleserver_config.js'));
        ctx.currentIDC = 'tc';
        var context = new BalanceContext('bookService', conf.bookService);
        var balance = new RoundRobinBalance();
        var server = balance.fetchServer(context);
        server.should.be.eql(conf.bookService.server[0]);
        (context.lastRoundRobinID === undefined).should.be.true;
    });
});


describe('hashring balance', function () {
    it('has right name', function () {
        var balance = new HashringBalance();
        balance.getName().should.be.equal('hashring');
    });

    it('has right catagory', function () {
        var balance = new HashringBalance();
        balance.getCategory().should.be.equal('balance');
    });

    it('has right context class', function () {
        var converter = new HashringBalance();
        converter.getContextClass().should.be.equal(BalanceContext);
    });

    it('hash result should stable', function () {
        var conf = config.load(path.join(__dirname, './config/idc_config.js'));
        var context = new BalanceContext('bookService4', conf.bookService4);
        var balance = new HashringBalance();
        var resultStore = {};
        for (var i = 0; i < 100; i++) {
            var server = balance.fetchServer(context, {
                balanceKey: i
            });
            resultStore[server.index] = resultStore[server.index] || [];
            resultStore[server.index].push(i);
        }
        // 哈希应该是稳定的
        for (i = 0; i < 100; i++) {
            server = balance.fetchServer(context, {
                balanceKey: i
            });
            resultStore[server.index].should.containEql(i);
        }
    });

    it('hash result should be same after server delete', function () {
        var conf = config.load(path.join(__dirname, './config/idc_config.js'));
        var context = new BalanceContext('bookService4', conf.bookService4);
        var balance = new HashringBalance();
        var resultStore = {};
        for (var i = 0; i < 100; i++) {
            var server = balance.fetchServer(context, {
                balanceKey: i
            });
            resultStore[server.index] = resultStore[server.index] || [];
            resultStore[server.index].push(i);
        }

        // 删除最后一个服务器，不应该影响之前服务的命中
        var lastServer = context.reqIDCServers.pop();
        context.hashring = null;
        for (i = 0; i < 100; i++) {
            server = balance.fetchServer(context, {
                balanceKey: i
            });
            if (resultStore[server.index].indexOf(i) === -1) {
                resultStore[9].should.containEql(i);
            }
        }
        context.reqIDCServers.push(lastServer);
    });

    it('hash result should be same after server add', function () {
        var conf = config.load(path.join(__dirname, './config/idc_config.js'));
        var context = new BalanceContext('bookService4', conf.bookService4);
        var balance = new HashringBalance();
        var resultStore = {};
        for (var i = 0; i < 100; i++) {
            var server = balance.fetchServer(context, {
                balanceKey: i
            });
            resultStore[server.index] = resultStore[server.index] || [];
            resultStore[server.index].push(i);
        }
        // 添加一个服务器，只应该命中原来的服务或者新的服务
        context.reqIDCServers.push({
            host: '127.0.0.11',
            port: 80,
            index: '10'
        });
        context.hashring = null;
        for (i = 0; i < 100; i++) {
            server = balance.fetchServer(context, {
                balanceKey: i
            });
            if (server.index !== '10') {
                resultStore[server.index].should.containEql(i);
            }
        }
    });

    it('direct use single server', function () {
        var conf = config.load(path.join(__dirname, './config/singleserver_config.js'));
        ctx.currentIDC = 'st';
        var context = new BalanceContext('bookService', conf.bookService);
        var balance = new HashringBalance();
        Math.random = function () {
            throw new Error();
        };
        (function () {
            balance.fetchServer(context, {
                balanceKey: 1
            });
        }).should.not.throwError();
        var server = balance.fetchServer(context, {
            balanceKey: 1
        });
        Math.random = SourceRandom;
        server.should.be.eql(conf.bookService.server[0]);
    });
});
