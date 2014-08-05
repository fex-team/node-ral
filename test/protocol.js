/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/5
 */

'use strict';

var Protocol = require('../lib/protocol.js').Protocol;
var ProtocolContext = require('../lib/protocol.js').ProtocolContext;
var HttpProtocol = require('../lib/ext/protocol/httpProtocol.js');
var HttpProtocolContext = require('../lib/ext/protocol/httpProtocol.js').HttpProtocolContext;

var mockHTTPService = {
    timeout: 1000,
    url: '/path/to/service',
    method: '',
    query: {
        a: 1,
        b: 2
    },
    headers: {
        'User-Agent': 'Chrome'
    }
};

var mockHTTPService2 = {
    timeout: 1000,
    url: '/path/to/service',
    method: '',
    query: 'a=1',
    headers: {
        'User-Agent': 'Chrome'
    }
};

describe('protocol', function () {
    it('should fail when get name', function () {
        var protocol = new Protocol();
        (function () {
            protocol.getName();
        }).should.be.throw(/Not Implemented/);
    });

    it('should get context class', function () {
        var protocol = new Protocol();
        protocol.getContext().should.be.equal(ProtocolContext);
    });

    it('should get null response when talk()', function (done) {
        var protocol = new Protocol();
        protocol.on('data', function (data) {
            (data === null).should.be.true;
            done();
        });
        protocol.talk();
    });
});

describe('http protocol', function () {
    it('should fail when get name', function () {
        var protocol = new HttpProtocol();
        protocol.getName().should.be.equal('http');
    });

    it('should get context class', function () {
        var protocol = new HttpProtocol();
        protocol.getContext().should.be.equal(HttpProtocolContext);
    });

    it('should get correct context', function () {
        var context = new HttpProtocolContext('mockHTTPService', mockHTTPService);
        context.serviceID.should.be.equal('mockHTTPService');
        context.timeout.should.be.equal(mockHTTPService.timeout);
        context.url.should.be.equal(mockHTTPService.url);
        context.method.should.be.equal(mockHTTPService.method);
        context.query.should.be.equal(mockHTTPService.query);
        context.headers.should.be.equal(mockHTTPService.headers);
    });

    it('should parse query string', function () {
        var context = new HttpProtocolContext('mockHTTPService2', mockHTTPService2);
        context.serviceID.should.be.equal('mockHTTPService2');
        context.query.should.be.eql({a: '1'});
    });
});