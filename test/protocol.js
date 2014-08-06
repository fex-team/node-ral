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
    path: '/path/to/service',
    method: 'GET',
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
    path: '/path/to/service',
    method: 'POST',
    query: 'a=1',
    headers: {
        'User-Agent': 'Chrome'
    }
};

var mockRequest = {
    options: {
        timeout: 100,
        query: 'b=1',
        headers: {
            'User-Agent': 'Webkit'
        }
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

    it('should correct prepare options', function () {
        var http = new HttpProtocol();
        var contextClass = http.getContext();
        var context = new contextClass('mockHTTPService', mockHTTPService2);
        var options = http._prepareOptions(context, {});
        options.timeout.should.be.equal(1000);
        options.path.should.be.equal('/path/to/service');
        options.query.should.be.eql({a: '1'});
        options.headers['User-Agent'].should.be.eql('Chrome');
    });

    it('should correct extend options', function () {
        var httpProtocol = new HttpProtocol();
        var contextClass = httpProtocol.getContext();
        var context = new contextClass('mockHTTPService', mockHTTPService2);
        var options = httpProtocol._prepareOptions(context, mockRequest);
        options.timeout.should.be.equal(100);
        options.path.should.be.equal('/path/to/service');
        options.query.should.be.eql({a: '1', b: '1'});
        options.headers['User-Agent'].should.be.eql('Webkit');
    });

    describe('http protocol with get method',function(){
        it('should work fine with GET method', function (done) {
            var get_test = require('./protocol/http_protocol_get_test.js');
            //start a http server for get
            var server = get_test.createServer();
            var httpProtocol = new HttpProtocol();
            var context = new HttpProtocolContext('mockHTTPService', get_test.service);
            var stream = httpProtocol.talk(context, get_test.request);
            var response = '';
            stream.on('data', function(data){
                response += data.toString();
            });
            stream.on('end', function(){
                response.toString().should.be.equal('hear you');
                server.close();
                done();
            });
        });

        it('should work fine with GET method and querystring', function (done) {
            var get_test = require('./protocol/http_protocol_get_test.js');
            //start a http server for get
            var server = get_test.createServer();
            var httpProtocol = new HttpProtocol();
            var context = new HttpProtocolContext('mockHTTPService', get_test.service);
            var stream = httpProtocol.talk(context, get_test.request_with_query);
            var response = '';
            stream.on('data', function(data){
                response += data.toString();
            });
            stream.on('end', function(){
                response.toString().should.be.equal('hear you hefangshi');
                server.close();
                done();
            });
        });

        it('should got 404 status when GET 404', function (done) {
            var get_test = require('./protocol/http_protocol_get_test.js');
            //start a http server for get
            var server = get_test.createServer();
            var httpProtocol = new HttpProtocol();
            var context = new HttpProtocolContext('mockHTTPService', get_test.service);
            var stream = httpProtocol.talk(context, get_test.request_404);
            stream.on('error', function(err){
                err.should.match(/Server Status Error: 404/);
                server.close();
                done();
            });
        });

        it('should got 503 status when GET 503', function (done) {
            var get_test = require('./protocol/http_protocol_get_test.js');
            //start a http server for get
            var server = get_test.createServer();
            var httpProtocol = new HttpProtocol();
            var context = new HttpProtocolContext('mockHTTPService', get_test.service);
            var stream = httpProtocol.talk(context, get_test.request_503);
            stream.on('error', function(err){
                err.should.match(/Server Status Error: 503/);
                server.close();
                done();
            });
        });
    });

    describe('http protocol with post method',function(){
        it('should work fine with GET method', function (done) {
            var post_test = require('./protocol/http_protocol_post_test.js');
            //start a http server for post
            var server = post_test.createServer();
            var httpProtocol = new HttpProtocol();
            var context = new HttpProtocolContext('mockHTTPService', post_test.service);
            var stream = httpProtocol.talk(context, post_test.request);
            var response = '';
            stream.on('data', function(data){
                response += data.toString();
            });
            stream.on('end', function(){
                response.toString().should.be.equal('hear you hefangshi');
                server.close();
                done();
            });
        });

        it('should got 404 status when GET 404', function (done) {
            var post_test = require('./protocol/http_protocol_post_test.js');
            //start a http server for post
            var server = post_test.createServer();
            var httpProtocol = new HttpProtocol();
            var context = new HttpProtocolContext('mockHTTPService', post_test.service);
            var stream = httpProtocol.talk(context, post_test.request_404);
            stream.on('error', function(err){
                server.close();
                err.should.match(/Server Status Error: 404/);
                done();
            });
        });

        it('should got 503 status when GET 503', function (done) {
            var post_test = require('./protocol/http_protocol_post_test.js');
            //start a http server for post
            var server = post_test.createServer();
            var httpProtocol = new HttpProtocol();
            var context = new HttpProtocolContext('mockHTTPService', post_test.service);
            var stream = httpProtocol.talk(context, post_test.request_503);
            stream.on('error', function(err){
                server.close();
                err.should.match(/Server Status Error: 503/);
                done();
            });
        });
    });
});

describe('http protocol context', function () {
    it('should get correct context', function () {
        var context = new HttpProtocolContext('mockHTTPService', mockHTTPService);
        context.serviceID.should.be.equal('mockHTTPService');
        context.timeout.should.be.equal(mockHTTPService.timeout);
        context.path.should.be.equal(mockHTTPService.path);
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