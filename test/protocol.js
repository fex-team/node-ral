/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/5
 */

'use strict';

var Protocol = require('../lib/protocol.js');
var HttpProtocol = require('../lib/ext/protocol/httpProtocol.js');
var util = require('../lib/util.js');

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

    it('has right catagory', function () {
        var protocol = new Protocol();
        protocol.getCategory().should.be.equal('protocol');
    });
});

describe('http protocol', function () {
    it('should fail when get name', function () {
        var protocol = new HttpProtocol();
        protocol.getName().should.be.equal('http');
    });

    it('has right catagory', function () {
        var protocol = new HttpProtocol();
        protocol.getCategory().should.be.equal('protocol');
    });

    describe('http protocol with get method',function(){
        it('should work fine with GET method', function (done) {
            var get_test = require('./protocol/http_protocol_get_test.js');
            //start a http server for get
            var server = get_test.createServer();
            var httpProtocol = new HttpProtocol();
            var context = HttpProtocol.normalizeConfig(get_test.service);
            util.merge(context, get_test.request);
            httpProtocol.talk(context, function(res){
                res.on('data', function(data){
                    server.close();
                    data.toString().should.be.equal('hear you');
                    done();
                });
            });
        });

        it('should work fine with GET method and querystring', function (done) {
            var get_test = require('./protocol/http_protocol_get_test.js');
            //start a http server for get
            var server = get_test.createServer();
            var httpProtocol = new HttpProtocol();
            var context = HttpProtocol.normalizeConfig(get_test.service);
            util.merge(context, get_test.request_with_query);
            httpProtocol.talk(context, function(res){
                res.on('data', function(data){
                    server.close();
                    data.toString().should.be.equal('hear you hefangshi');
                    done();
                });
            });
        });

        it('should got 404 status when GET 404', function (done) {
            var get_test = require('./protocol/http_protocol_get_test.js');
            //start a http server for get
            var server = get_test.createServer();
            var httpProtocol = new HttpProtocol();
            var context = HttpProtocol.normalizeConfig(get_test.service);
            util.merge(context, get_test.request_404);
            var stream = httpProtocol.talk(context);
            stream.on('error', function(err){
                server.close();
                err.should.match(/Server Status Error: 404/);
                done();
            });
        });

        it('should got 503 status when GET 503', function (done) {
            var get_test = require('./protocol/http_protocol_get_test.js');
            //start a http server for get
            var server = get_test.createServer();
            var httpProtocol = new HttpProtocol();
            var context = HttpProtocol.normalizeConfig(get_test.service);
            util.merge(context, get_test.request_404);
            var stream = httpProtocol.talk(context);
            stream.on('error', function(err){
                server.close();
                err.should.match(/Server Status Error: 503/);
                done();
            });
        });
    });

    describe('http protocol with post method',function(){
        it('should work fine with POST method', function (done) {
            var post_test = require('./protocol/http_protocol_post_test.js');
            //start a http server for post
            var server = post_test.createServer();
            var httpProtocol = new HttpProtocol();
            var context = HttpProtocol.normalizeConfig(post_test.service);
            util.merge(context, post_test.request);
            var request = httpProtocol.talk(context, function(res){
                res.on('data', function(data){
                    server.close();
                    data.toString().should.be.equal('hear you hefangshi with file http_protocol_post_test.js');
                    done();
                });
            });
            post_test.request.data.pipe(request);
        });

        it('should work fine with POST method when post a plan object', function (done) {
            var post_test = require('./protocol/http_protocol_post_test.js');
            //start a http server for post
            var server = post_test.createServer();
            var httpProtocol = new HttpProtocol();
            var context =HttpProtocol.normalizeConfig(post_test.service);
            util.merge(context, post_test.request_with_urlencode);
            var request = httpProtocol.talk(context, function(res){
                res.on('data', function(data){
                    server.close();
                    data.toString().should.be.equal('hear you hefangshi');
                    done();
                });
            });
            post_test.request_with_urlencode.data.pipe(request);
        });

        it('should work fine with POST gbk form', function (done) {
            var post_test = require('./protocol/http_protocol_post_test.js');
            //start a http server for post
            var server = post_test.createServer('gbk');
            var httpProtocol = new HttpProtocol();
            var context = HttpProtocol.normalizeConfig(post_test.service);
            util.merge(context, post_test.request_gbk_form);
            var request = httpProtocol.talk(context, function(res){
                res.on('data', function(data){
                    server.close();
                    data.toString().should.be.equal('hear you 何方石 with file http_protocol_post_test.js');
                    done();
                });
            });
            post_test.request_gbk_form.data.pipe(request);
        });

        it('should got 404 status when GET 404', function (done) {
            var post_test = require('./protocol/http_protocol_post_test.js');
            //start a http server for post
            var server = post_test.createServer();
            var httpProtocol = new HttpProtocol();
            var context = HttpProtocol.normalizeConfig(post_test.service);
            util.merge(context, post_test.request_404);
            var stream = httpProtocol.talk(context);
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
            var options = HttpProtocol.normalizeConfig(post_test.service);
            util.merge(options, post_test.request_404);
            var stream = httpProtocol.talk(options);
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
        var context = HttpProtocol.normalizeConfig(mockHTTPService);
        context.timeout.should.be.equal(mockHTTPService.timeout);
        context.path.should.be.equal(mockHTTPService.path);
        context.method.should.be.equal(mockHTTPService.method);
        context.query.should.be.equal(mockHTTPService.query);
        context.headers.should.be.equal(mockHTTPService.headers);
    });

    it('should parse query string', function () {
        var context = HttpProtocol.normalizeConfig(mockHTTPService2);
        context.query.should.be.eql({a: '1'});
    });
});