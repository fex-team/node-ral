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

describe('mock', function () {
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

    it('should init successfully with mock', function () {
        process.env.RAL_MOCK = '1';
        ral.init({
            confDir: path.join(__dirname, './ral/config'),
            mockDir: path.join(__dirname, './ral/mock'),
            logger: {
                log_path: path.join(__dirname, '../logs'),
                app: 'yog-ral'
            },
            currentIDC: 'tc'
        });
        process.env.RAL_MOCK = '0';
        isInited.emit('done');
    });

    it('should use mock when RAL_MOCK=true', function (done) {
        before(function (ok) {
            isInited.on('done', ok);
        });
        var req = ral('GET_QS_SERV');
        var start = Date.now();
        req.on('data', function (data) {
            data.query.from.should.eql('mock');
            data.port.should.eql(8192);
            (Date.now() - start < 50).should.be.true;
            done();
        });
    });

    it('should mock resp time correctly', function (done) {
        before(function (ok) {
            isInited.on('done', ok);
        });
        var req = ral('CHANGE_PACK_UNPACK');
        var start = Date.now();
        req.on('data', function (data) {
            data.query.from.should.eql('mock');
            data.port.should.eql(8193);
            (Date.now() - start > 500).should.be.true;
            (Date.now() - start < 1000).should.be.true;
            done();
        });
    });

    it('support plain object', function (done) {
        before(function (ok) {
            isInited.on('done', ok);
        });
        var req = ral('TEST_QUERY_SERV');
        req.on('data', function (data) {
            data.query.from.should.eql('mock_plan');
            data.port.should.eql(8194);
            done();
        });
    });

    it('support degrade on fatal', function (done) {
        before(function (ok) {
            isInited.on('done', ok);
        });
        var req = ral('POST_QS_SERV', {
            degrade: {
                query: {
                    from: 'degrade'
                },
                port: 0
            }
        });
        req.on('data', function (data) {
            data.query.from.should.eql('degrade');
            data.port.should.eql(0);
            done();
        });

        req.on('error', function (err) {
            done(err);
        });
    });


    it('should catch mock error', function (done) {
        before(function (ok) {
            isInited.on('done', ok);
        });
        var req = ral('GET_QS_SERV', {
            query: {
                type: 'error'
            }
        });
        req.on('data', function (data) {
            done(new Error());
        });
        req.on('error', function (err) {
            err.message.should.eql('mock error');
            done();
        });
    });

    it('support RAL_MOCK to set mock service', function (done) {
        process.env.RAL_MOCK = 'TEST_QUERY_SERV,CHANGE_PACK_UNPACK';
        ral.init({
            confDir: path.join(__dirname, './ral/config'),
            mockDir: path.join(__dirname, './ral/mock'),
            logger: {
                log_path: path.join(__dirname, '../logs'),
                app: 'yog-ral'
            },
            currentIDC: 'tc'
        });
        process.env.RAL_MOCK = false;
        var req = ral('GET_QS_SERV');
        var count = 3;
        req.on('data', function (data) {
            [8192, 8193].should.containEql(data.port);
            data.port.should.not.eql(8194);
            data.query.from.should.eql('ral');
            count--;
            !count && done();
        });
        var req2 = ral('TEST_QUERY_SERV');
        req2.on('data', function (data) {
            data.query.from.should.eql('mock_plan');
            data.port.should.eql(8194);
            count--;
            !count && done();
        });
        var req3 = ral('CHANGE_PACK_UNPACK');
        var start = Date.now();
        req3.on('data', function (data) {
            data.query.from.should.eql('mock');
            data.port.should.eql(8193);
            (Date.now() - start > 500).should.be.true;
            (Date.now() - start < 1000).should.be.true;
            count--;
            !count && done();
        });
    });

    it('support enableMock in service conf', function (done) {
        process.env.RAL_MOCK = 'what';
        ral.init({
            confDir: path.join(__dirname, './ral/config'),
            mockDir: path.join(__dirname, './ral/mock'),
            logger: {
                log_path: path.join(__dirname, '../logs'),
                app: 'yog-ral'
            },
            currentIDC: 'tc'
        });
        process.env.RAL_MOCK = false;
        // should degrade since POST_QS_SERV's enableMock=true
        var req = ral('POST_QS_SERV', {
            data: {
                msg: 'hi',
                name: '何方石'
            }
        });
        req.on('data', function (data) {
            console.log(data);
            done();
        });
        req.on('error', function (err) {
            err.message.should.eql('mock fatal hit');
            done();
        });
    });


    it('should dont mock anything when RAL_MOCK is null', function (done) {
        delete process.env.RAL_MOCK;
        ral.init({
            confDir: path.join(__dirname, './ral/config'),
            mockDir: path.join(__dirname, './ral/mock'),
            logger: {
                log_path: path.join(__dirname, '../logs'),
                app: 'yog-ral'
            },
            currentIDC: 'tc'
        });
        // should degrade since POST_QS_SERV's enableMock=true
        var req = ral('POST_QS_SERV', {
            data: {
                msg: 'hi',
                name: '何方石'
            }
        });
        req.on('data', function (data) {
            done();
        });
        req.on('error', function (err) {
            err.message.should.eql('mock fatal hit');
            done();
        });
    });
});
