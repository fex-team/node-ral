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
            data.port.should.eql(8192);
            (Date.now() - start > 500).should.be.true;
            (Date.now() - start < 1000).should.be.true;
            done();
        });
    });

    it('support plain object', function (done) {
        before(function (ok) {
            isInited.on('done', ok);
        });
        var req = ral('CHANGE_PACK_UNPACK');
        var start = Date.now();
        req.on('data', function (data) {
            data.query.from.should.eql('mock');
            data.port.should.eql(8192);
            done();
        });
    });
});
