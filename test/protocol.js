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
var CTX = require('../lib/ctx.js');

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

var mockHTTPService3 = {
    timeout: 1000,
    path: 'path/to/service',
    method: 'POST',
    query: 'a=1',
    headers: {
        'User-Agent': 'Chrome'
    }
};

var mockHTTPService4 = {
    timeout: 1000,
    path: 'path/to/ service',
    method: 'POST',
    query: 'a=1',
    headers: {
        'User-Agent': 'Chrome'
    }
};

var mockProxyService = {
    timeout: 1000,
    path: 'path/to/service',
    method: 'POST',
    query: 'a=1',
    headers: {
        'User-Agent': 'Chrome'
    },
    proxy: [
        {
            uri: 'http://127.0.0.1:8083',
            idc: 'jx'
        },
        {
            uri: 'http://127.0.0.1:8084',
            idc: 'tc'
        },
        {
            uri: 'http://127.0.0.1:8085',
            idc: 'default'
        }
    ]
};

var mockProxyService2 = {
    timeout: 1000,
    path: 'path/to/service',
    method: 'POST',
    query: 'a=1',
    headers: {
        'User-Agent': 'Chrome'
    },
    proxy: [
        {
            uri: 'http://127.0.0.1:8085',
            idc: 'default'
        },
        {
            uri: 'http://127.0.0.1:8084',
            idc: 'tc'
        }
    ]
};

var mockProxyService3 = {
    timeout: 1000,
    path: 'path/to/service',
    method: 'POST',
    query: 'a=1',
    headers: {
        'User-Agent': 'Chrome'
    },
    proxy: 'http://127.0.0.1:8085'
};

var mockProxyService4 = {
    timeout: 1000,
    path: 'path/to/service',
    method: 'POST',
    query: 'a=1',
    headers: {
        'User-Agent': 'Chrome'
    },
    proxy: [
        {
            uri: 'http://127.0.0.1:8088',
            idc: 'jx-fake'
        },
        {
            uri: 'http://127.0.0.1:8084',
            idc: 'tc'
        }
    ]
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
                res.on('end', function (data) {
                    server.close();
                    data.toString().should.be.match(/hear you.*end$/);
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
                res.on('end', function (data) {
                    server.close();
                    data.toString().should.be.match(/hear you hefangshi.*end$/);
                    done();
                });
            });
        });

        it('should work fine with GET when already has query in path', function (done) {
            var getTest = require('./protocol/http_protocol_get_test.js');
            // start a http server for get
            var server = getTest.createServer();
            var httpProtocol = new HttpProtocol();
            var context = HttpProtocol.normalizeConfig(getTest.service);
            util.merge(context, getTest.requestWithQueryInPath);
            httpProtocol.talk(context, function (res) {
                res.on('end', function (data) {
                    server.close();
                    data.toString().should.be.match(/hear you hefangshi.*end$/);
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

        (process.env.CI ? it : it.skip)('should work well with https', function (done) {
            var getTest = require('./protocol/http_protocol_get_test.js');
            // start a http server for get
            //            var server = getTest.createServer();
            var httpProtocol = new HttpProtocol();
            var context = HttpProtocol.normalizeConfig(getTest.requestHttps);
            var stream = httpProtocol.talk(context, function (res) {
                res.on('end', function (data) {
                    done();
                });
            });
            stream.on('error', function (err) {
                err.should.be.null;
            });
        });

        (process.env.CI ? it : it.skip)('should work well with https protocol', function (done) {
            var getTest = require('./protocol/http_protocol_get_test.js');
            // start a http server for get
            //            var server = getTest.createServer();
            var httpsProtocol = new HttpsProtocol();
            var context = HttpsProtocol.normalizeConfig(getTest.requestHttpsWithProtocol);
            var stream = httpsProtocol.talk(context, function (res) {
                res.on('end', function (data) {
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
                res.on('end', function (data) {
                    server.close();
                    data.toString().should.be.match(
                        /hear you hefangshi with file http_protocol_post_test.js.*end$/);
                    done();
                });
                res.on('error', function (data) {
                    server.close();
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
                res.on('end', function (data) {
                    server.close();
                    data.toString().should.be.match(/hear you hefangshi.*end$/);
                    done();
                });

                res.on('error', function (data) {
                    server.close();
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
                res.on('end', function (data) {
                    server.close();
                    data.toString().should.be.match(
                        /hear you �η�ʯ with file http_protocol_post_test.js.*end$/);
                    done();
                });
                res.on('error', function (data) {
                    server.close();
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

        it('should unzip gzip content', function (done) {
            var getTest = require('./protocol/http_protocol_get_test.js');
            // start a http server for get
            var server = getTest.createServer();
            var httpProtocol = new HttpProtocol();
            var context = HttpProtocol.normalizeConfig(getTest.service);
            context.path = '/gzip';
            context.disableGzip = false;
            util.merge(context, getTest.request);
            httpProtocol.talk(context, function (res) {
                res.on('end', function (data) {
                    server.close();
                    data.toString().should.be.equal('hear you');
                    done();
                });
            });
        });

        it('should inflate deflate content', function (done) {
            var getTest = require('./protocol/http_protocol_get_test.js');
            // start a http server for get
            var server = getTest.createServer();
            var httpProtocol = new HttpProtocol();
            var context = HttpProtocol.normalizeConfig(getTest.service);
            context.path = '/deflate';
            context.disableGzip = false;
            util.merge(context, getTest.request);
            httpProtocol.talk(context, function (res) {
                res.on('end', function (data) {
                    server.close();
                    data.toString().should.be.equal('hear you');
                    done();
                });
            });
        });

        it('should handle unzip error', function (done) {
            var getTest = require('./protocol/http_protocol_get_test.js');
            // start a http server for get
            var server = getTest.createServer();
            var httpProtocol = new HttpProtocol();
            var context = HttpProtocol.normalizeConfig(getTest.service);
            context.path = '/gziperror';
            context.disableGzip = false;
            util.merge(context, getTest.request);
            httpProtocol.talk(context, function (res) {
                res.on('end', function (data) {
                    server.close();
                    data.toString().should.not.be.ok;
                    done();
                });
                res.on('error', function (err) {
                    server.close();
                    err.message.should.be.match(/unexpected end of file/);
                    done();
                });
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

    it('should fix path to be started with /', function () {
        var context = HttpProtocol.normalizeConfig(mockHTTPService3);
        context.path.should.be.eql('/path/to/service');
    });

    it('should fix path when contains spaces', function () {
        var context = HttpProtocol.normalizeConfig(mockHTTPService4);
        context.path.should.be.eql('/path/to/%20service');
    });
});

describe('http proxy', function () {
    it('should get correct idc proxy config', function () {
        var originIDC = CTX.currentIDC;
        CTX.currentIDC = 'jx';
        var context = HttpProtocol.normalizeConfig(mockProxyService);
        context.proxy.should.be.equal('http://127.0.0.1:8083');
        CTX.currentIDC = originIDC;
    });

    it('should get default proxy when idc is not match', function () {
        var originIDC = CTX.currentIDC;
        CTX.currentIDC = 'jx';
        var context = HttpProtocol.normalizeConfig(mockProxyService2);
        context.proxy.should.be.equal('http://127.0.0.1:8085');
        CTX.currentIDC = originIDC;
    });

    it('should get proxy when none idc is set', function () {
        var originIDC = CTX.currentIDC;
        CTX.currentIDC = 'jx';
        var context = HttpProtocol.normalizeConfig(mockProxyService3);
        context.proxy.should.be.equal('http://127.0.0.1:8085');
        CTX.currentIDC = originIDC;
    });


    it('should get first proxy when idc proxy is not found and no default proxy', function () {
        var originIDC = CTX.currentIDC;
        CTX.currentIDC = 'jx';
        var context = HttpProtocol.normalizeConfig(mockProxyService4);
        context.proxy.should.be.equal('http://127.0.0.1:8088');
        CTX.currentIDC = originIDC;
    });
});

describe('beforeRequest hook', function () {
    it('should trigger before request', function (done) {
        var getTest = require('./protocol/http_protocol_get_test.js');
            // start a http server for get
            var server = getTest.createServer();
            var httpProtocol = new HttpProtocol();
            var context = HttpProtocol.normalizeConfig(getTest.service);
            context.path = '/gziperror';
            context.disableGzip = false;
            context.beforeRequest = function (context) {
                context.server.port.should.be.eql(8934);
                context.server.host.should.be.eql('127.0.0.1');
                return context;
            }
            util.merge(context, getTest.request);
            httpProtocol.talk(context, function (res) {
                res.on('end', function (data) {
                    server.close();
                    data.toString().should.not.be.ok;
                    done();
                });
                res.on('error', function (err) {
                    server.close();
                    err.message.should.be.match(/unexpected end of file/);
                    done();
                });
            });
    });

    it('should cancel request by return false', function () {
        var getTest = require('./protocol/http_protocol_get_test.js');
            // start a http server for get
            // var server = getTest.createServer();
            var httpProtocol = new HttpProtocol();
            var context = HttpProtocol.normalizeConfig(getTest.service);
            context.path = '/gziperror';
            context.disableGzip = false;
            context.beforeRequest = function (context) {
                return false;
            }
            util.merge(context, getTest.request);
            try {
                httpProtocol.talk(context);
            } catch (ex) {
                // server.close();
                ex.message.toString().should.be.eql('Request was canceled by beforeRequest hook since returned context was false');
            }
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
            res.on('end', function (data) {
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
            res.on('end', function (data) {
                data.GetCityForecastByZIPResult.should.be.ok;
                done();
            });
        });
    });

});
