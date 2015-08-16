/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/5
 */

/* eslint-disable no-wrap-func */
/* eslint-disable max-nested-callbacks, no-console */

'use strict';

var Protocol = require('../lib/protocol.js');
var HttpProtocol = require('../lib/ext/protocol/httpProtocol.js');
var HttpsProtocol = require('../lib/ext/protocol/httpsProtocol.js');
var SoapProtocol = require('../lib/ext/protocol/soapProtocol.js');
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

    describe('http protocol with get method', function () {
        it('should work fine with GET method', function (done) {
            var getTest = require('./protocol/http_protocol_get_test.js');
            // start a http server for get
            var server = getTest.createServer();
            var httpProtocol = new HttpProtocol();
            var context = HttpProtocol.normalizeConfig(getTest.service);
            util.merge(context, getTest.request);
            httpProtocol.talk(context, function (res) {
                res.on('data', function (data) {
                    server.close();
                    data.toString().should.be.equal('hear you');
                    done();
                });
            });
        });

        it('should work fine with GET method and querystring', function (done) {
            var getTest = require('./protocol/http_protocol_get_test.js');
            // start a http server for get
            var server = getTest.createServer();
            var httpProtocol = new HttpProtocol();
            var context = HttpProtocol.normalizeConfig(getTest.service);
            util.merge(context, getTest.requestWithQuery);
            httpProtocol.talk(context, function (res) {
                res.on('data', function (data) {
                    server.close();
                    data.toString().should.be.equal('hear you hefangshi');
                    done();
                });
            });
        });

        it('should got 404 status when GET 404', function (done) {
            var getTest = require('./protocol/http_protocol_get_test.js');
            // start a http server for get
            var server = getTest.createServer();
            var httpProtocol = new HttpProtocol();
            var context = HttpProtocol.normalizeConfig(getTest.service);
            util.merge(context, getTest.request404);
            var stream = httpProtocol.talk(context);
            stream.on('error', function (err) {
                server.close();
                err.statusCode.should.be.equal(404);
                err.message.should.match(/Server Status Error: 404/);
                done();
            });
        });

        it('should got 503 status when GET 503', function (done) {
            var getTest = require('./protocol/http_protocol_get_test.js');
            // start a http server for get
            var server = getTest.createServer();
            var httpProtocol = new HttpProtocol();
            var context = HttpProtocol.normalizeConfig(getTest.service);
            util.merge(context, getTest.request503);
            var stream = httpProtocol.talk(context);
            stream.on('error', function (err) {
                server.close();
                err.statusCode.should.be.equal(503);
                err.message.should.match(/Server Status Error: 503/);
                done();
            });
        });

        it('should work well with https', function (done) {
            var getTest = require('./protocol/http_protocol_get_test.js');
            // start a http server for get
            //            var server = getTest.createServer();
            var httpProtocol = new HttpProtocol();
            var context = HttpProtocol.normalizeConfig(getTest.requestHttps);
            var stream = httpProtocol.talk(context, function (res) {
                res.on('data', function (data) {
                    done();
                });
            });
            stream.on('error', function (err) {
                err.should.be.null;
            });
        });

        it('should work well with https protocol', function (done) {
            var getTest = require('./protocol/http_protocol_get_test.js');
            // start a http server for get
            //            var server = getTest.createServer();
            var httpsProtocol = new HttpsProtocol();
            var context = HttpsProtocol.normalizeConfig(getTest.requestHttpsWithProtocol);
            var stream = httpsProtocol.talk(context, function (res) {
                res.on('data', function (data) {
                    done();
                });
            });
            stream.on('error', function (err) {
                err.should.be.null;
            });
        });
    });

    describe('http protocol with post method', function () {
        it('should work fine with POST method', function (done) {
            var postTest = require('./protocol/http_protocol_post_test.js');
            // start a http server for post
            var server = postTest.createServer();
            var httpProtocol = new HttpProtocol();
            var context = HttpProtocol.normalizeConfig(postTest.service);
            util.merge(context, postTest.request);
            var request = httpProtocol.talk(context, function (res) {
                res.on('data', function (data) {
                    server.close();
                    data.toString().should.be.equal(
                        'hear you hefangshi with file http_protocol_post_test.js');
                    done();
                });
            });
            postTest.request.data.pipe(request);
        });

        it('should work fine with POST method when post a plan object', function (done) {
            var postTest = require('./protocol/http_protocol_post_test.js');
            // start a http server for post
            var server = postTest.createServer();
            var httpProtocol = new HttpProtocol();
            var context = HttpProtocol.normalizeConfig(postTest.service);
            util.merge(context, postTest.requestWithUrlencode);
            var request = httpProtocol.talk(context, function (res) {
                res.on('data', function (data) {
                    server.close();
                    data.toString().should.be.equal('hear you hefangshi');
                    done();
                });
            });
            postTest.requestWithUrlencode.data.pipe(request);
        });

        it('should work fine with POST gbk form', function (done) {
            var postTest = require('./protocol/http_protocol_post_test.js');
            // start a http server for post
            var server = postTest.createServer('gbk');
            var httpProtocol = new HttpProtocol();
            var context = HttpProtocol.normalizeConfig(postTest.service);
            util.merge(context, postTest.requestGBKForm);
            var request = httpProtocol.talk(context, function (res) {
                res.on('data', function (data) {
                    server.close();
                    data.toString().should.be.equal(
                        'hear you 何方石 with file http_protocol_post_test.js');
                    done();
                });
            });
            postTest.requestGBKForm.data.pipe(request);
        });

        it('should got 404 status when GET 404', function (done) {
            var postTest = require('./protocol/http_protocol_post_test.js');
            // start a http server for post
            var server = postTest.createServer();
            var httpProtocol = new HttpProtocol();
            var context = HttpProtocol.normalizeConfig(postTest.service);
            util.merge(context, postTest.request404);
            var stream = httpProtocol.talk(context);
            stream.on('error', function (err) {
                server.close();
                err.statusCode.should.be.equal(404);
                err.message.should.match(/Server Status Error: 404/);
                done();
            });
        });

        it('should got 503 status when GET 503', function (done) {
            var postTest = require('./protocol/http_protocol_post_test.js');
            // start a http server for post
            var server = postTest.createServer();
            var httpProtocol = new HttpProtocol();
            var options = HttpProtocol.normalizeConfig(postTest.service);
            util.merge(options, postTest.request503);
            var stream = httpProtocol.talk(options);
            stream.on('error', function (err) {
                server.close();
                err.statusCode.should.be.equal(503);
                err.message.should.match(/Server Status Error: 503/);
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
        context.query.should.be.eql({
            a: '1'
        });
    });
});

describe('soap protocol', function () {
    it.skip('should request wsdl service successfully', function (done) {
        var soapTest = require('./protocol/soap_protocol.js');
        var context = SoapProtocol.normalizeConfig(soapTest);
        context.method = 'GetCityForecastByZIP';
        context.payload = {
            ZIP: 10020
        };
        var soapProtocol = new SoapProtocol();
        soapProtocol.talk(context, function (res) {
            res.on('data', function (data) {
                data.GetCityForecastByZIPResult.should.be.ok;
                done();
            });
        });
    });

    it.skip('should request wsdl service with service.port successfully', function (done) {
        var soapTest = require('./protocol/soap_protocol.js');
        var context = SoapProtocol.normalizeConfig(soapTest);
        context.soapService = 'Weather';
        context.soapPort = 'WeatherSoap12';
        context.method = 'GetCityForecastByZIP';
        context.payload = {
            ZIP: 10020
        };
        var soapProtocol = new SoapProtocol();
        soapProtocol.talk(context, function (res) {
            res.on('data', function (data) {
                data.GetCityForecastByZIPResult.should.be.ok;
                done();
            });
        });
    });

});
