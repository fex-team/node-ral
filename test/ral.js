/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/8
 */

/*global before*/
/* eslint-disable max-nested-callbacks, no-console */
/* eslint-disable fecs-camelcase, camelcase */
/* eslint-disable no-wrap-func */

'use strict';

var ral = require('../lib/ral.js');
var path = require('path');
var server = require('./ral/server.js');
var EE = require('events').EventEmitter;

var isInited = new EE();

describe('ral', function () {
    var servers = [];

    beforeEach(function () {
        servers.push(server.bookService(8192));
        servers.push(server.bookService(8193));
        servers.push(server.bookService(8194));
    });

    afterEach(function () {
        servers.map(function (srv) {
            try {
                srv.close();
            }
            catch (e) {}
        });
        servers = [];
    });

    it('show raw request time', function (done) {
        var body = '';
        var req = require('http').request('http://127.0.0.1:8192', function (res) {
            res.on('data', function (d) {
                body += d;
            }).on('end', function () {
                var data = JSON.parse(body);
                data.port.should.be.eql(8192);
                done();
            });
        }).on('error', function (e) {
            e.should.not.be.ok;
        });
        req.end();
    });

    it('show request time with module request', function (done) {
        require('request').get('http://127.0.0.1:8192', {}, function (err, response, body) {
            (err === null).should.be.true;
            var data = JSON.parse(body);
            data.port.should.be.eql(8192);
            done();
        });
    });

    it('should init successfully', function () {
        ral.init({
            confDir: path.join(__dirname, './ral/config'),
            logger: {
                log_path: path.join(__dirname, '../logs'),
                app: 'yog-ral'
            },
            currentIDC: 'tc'
        });
        isInited.emit('done');
    });

    it('should make request correctly', function (done) {
        before(function (ok) {
            isInited.on('done', ok);
        });
        var req = ral('GET_QS_SERV');
        req.on('data', function (data) {
            [8192, 8193].should.containEql(data.port);
            data.port.should.not.eql(8194);
            data.query.from.should.eql('ral');
            done();
        });
    });

    // it('should get headers', function (done) {
    //     console.log('head');
    //     before(function( ok ){
    //         isInited.on('done', ok);
    //     });
    //     var req = ral('GET_QS_SERV');
    //     req.on('header', function(header){
    //         console.log(header);
    //         done();
    //     });
    // });

    it('should make request with data correctly', function (done) {
        before(function (ok) {
            isInited.on('done', ok);
        });
        var req = ral('GET_QS_SERV', {
            data: {
                msg: 'hi',
                name: '何方石'
            }
        });
        req.on('data', function (data) {
            servers.map(function (srv) {
                srv.close();
            });
            [8192, 8193].should.containEql(data.port);
            data.port.should.not.eql(8194);
            data.query.from.should.eql('ral');
            data.query.msg.should.eql('hi');
            data.query.name.should.eql('何方石');
            done();
        });
    });

    it('should override the options correctly', function (done) {
        before(function (ok) {
            isInited.on('done', ok);
        });
        var req = ral('GET_QS_SERV', {
            path: '/404',
            tag: 404
        });
        req.on('error', function (err) {
            err.toString().should.be.match(/404/);
            var reqNormal = ral('GET_QS_SERV', {
                query: {
                    normal: true
                }
            });
            reqNormal.on('data', function (data) {
                data.query.from.should.eql('ral');
                done();
            });
        });

    });

    it('should get large content correctly', function (done) {
        before(function (ok) {
            isInited.on('done', ok);
        });
        var req = ral('GET_QS_SERV', {
            path: '/largecontent'
        });
        req.on('data', function (data) {
            data.res.should.be.an.instanceOf(Object);
            done();
        });
        req.on('error', function (err) {
            err.should.not.be.ok;
            done();
        });
    });

    it('should report unpack error', function (done) {
        before(function (ok) {
            isInited.on('done', ok);
        });
        var req = ral('GET_QS_SERV', {
            data: {
                msg: 'hi'
            },
            encoding: 'blah'
        });
        req.on('error', function (err) {
            err.toString().should.be.match(/Encoding/);
            done();
        });
    });

    it('should invoke timeout', function (done) {
        before(function (ok) {
            isInited.on('done', ok);
        });
        var req = ral('GET_QS_SERV', {
            path: '/timeout',
            data: {
                msg: 'hi',
                name: 'timeout'
            },
            retry: 2,
            timeout: 100
        });
        req.on('data', function (data) {
            console.log(data);
        });
        req.on('error', function (err) {
            err.should.be.match(/request time out/);
            done();
        });
    });

    it('should make POST request with form data correctly', function (done) {
        before(function (ok) {
            isInited.on('done', ok);
        });
        var req = ral('POST_QS_SERV', {
            data: {
                msg: 'hi',
                name: '何方石'
            }
        });
        req.on('data', function (data) {
            servers.map(function (srv) {
                srv.close();
            });
            [8192, 8193].should.containEql(data.port);
            data.port.should.not.eql(8194);
            data.query.msg.should.eql('hi');
            data.query.name.should.eql('何方石');
            done();
        });
    });

    it('could change pack and unpack', function (done) {
        before(function (ok) {
            isInited.on('done', ok);
        });
        var req = ral('CHANGE_PACK_UNPACK', {
            data: {
                msg: 'hi',
                name: '何方石'
            },
            pack: 'querystring',
            unpack: 'json',
            retry: 2,
            timeout: 100
        });
        req.on('data', function (data) {
            data.query.msg.should.eql('hi');
            data.query.name.should.eql('何方石');
            data.query.from.should.eql('change');
            req = ral('CHANGE_PACK_UNPACK', {
                data: {
                    msg: 'hi',
                    name: '何方石'
                },
                retry: 2,
                timeout: 100
            });
            req.on('error', function (err) {
                err.message.should.be.match(/invalid pack data/);
                done();
            });
        });
    });

    it('should throw error when use a invalid service', function (done) {
        before(function (ok) {
            isInited.on('done', ok);
        });
        var req = ral('POST_QS_SERV_INVALID', {
            data: {
                msg: 'hi',
                name: '何方石'
            }
        });
        req.on('error', function (err) {
            err.toString().should.be.match(/invalid service name/);
            done();
        });
    });

    it('should caught buffer pack error', function (done) {
        before(function (ok) {
            isInited.on('done', ok);
        });
        var req = ral('GET_QS_SERV', {
            data: {
                some: 'how'
            },
            encoding: 'blah'
        });
        req.on('error', function (error) {
            error.toString().should.be.match(/Encoding not recognized/);
            done();
        });
    });

    it('should caught buffer unpack error', function (done) {
        before(function (ok) {
            isInited.on('done', ok);
        });
        var req = ral('GET_QS_SERV', {
            path: '/content'
        });
        req.on('error', function (error) {
            error.toString().should.be.match(/Unexpected token/);
            done();
        });
    });

    it('should caught error when server failed', function (done) {
        before(function (ok) {
            isInited.on('done', ok);
        });
        var req = ral('GET_QS_SERV', {
            path: '/close',
            timeout: 200
        });
        req.on('error', function (error) {
            error.toString().should.be.match(/request time out/);
            done();
        });
    });

    it('query config should independent', function (done) {
        before(function (ok) {
            isInited.on('done', ok);
        });
        var query = {
            pageSize: '20',
            pageNo: '1',
            catId: '5000009',
            catLevel: '3'
        };
        var req = ral('TEST_QUERY_SERV', {
            query: query
        });
        req.on('data', function (data) {
            data.query.should.be.eql(query);
            query = {
                pageSize: '20',
                pageNo: '1',
                keyword: 'TOTO'
            };
            var req2 = ral('TEST_QUERY_SERV', {
                query: query
            });
            req2.on('data', function (data2) {
                data2.query.should.be.eql(query);
                query = {
                    pageSize: '20',
                    pageNo: '1',
                    catId: '5000009',
                    catLevel: '4'
                };
                var req3 = ral('TEST_QUERY_SERV', {
                    query: query
                });
                req3.on('data', function (data3) {
                    data3.query.should.be.eql(query);
                    done();
                });
            });
        });
    });

    it('should catch onData error when catchCallback is true', function (done) {
        before(function (ok) {
            isInited.on('done', ok);
        });
        var req = ral('GET_QS_SERV', {
            catchCallback: true
        });
        req.on('data', function (data) {
            throw new Error('lalala');
        });
        req.on('error', function (err) {
            err.message.should.be.match(/lalal/);
            done();
        });
    });

    it.skip('should work fine with soap', function (done) {
        before(function (ok) {
            isInited.on('done', ok);
        });
        var req = ral('SOAP', {
            method: 'GetCityForecastByZIP',
            data: {
                ZIP: 10020 // 纽约的邮编
            }
        });
        req.on('data', function (data) {
            data.GetCityForecastByZIPResult.should.be.ok;
            done();
        });
    });

    it.skip('should work fine with soap timeout', function (done) {
        before(function (ok) {
            isInited.on('done', ok);
        });
        var req = ral('SOAP', {
            timeout: 1,
            method: 'GetCityForecastByZIP',
            data: {
                ZIP: 10020 // 纽约的邮编
            }
        });
        req.on('error', function (err) {
            err.message.should.be.match(/request time out/);
            done();
        });
    });

    it('should use right context when concurrency request', function (done) {
        before(function (ok) {
            isInited.on('done', ok);
        });
        var count = 2;
        ral('CHANGE_PACK_UNPACK', {
            data: {
                msg: 'hi',
                name: '何方石'
            },
            pack: 'querystring',
            unpack: 'json',
            retry: 2,
            timeout: 100
        }).on('data', function (data) {
            data.query.msg.should.eql('hi');
            data.query.name.should.eql('何方石');
            data.query.from.should.eql('change');
            partialDone();
        });
        ral('CHANGE_PACK_UNPACK', {
            data: {
                msg: 'hi',
                name: '何方石'
            },
            pack: 'stream',
            unpack: 'stream',
            retry: 2,
            timeout: 100
        }).on('error', function (err) {
            err.message.should.be.match(/invalid pack data/);
            partialDone();
        });

        function partialDone() {
            count--;
            if (count === 0) {
                done();
            }
        }
    });
});
