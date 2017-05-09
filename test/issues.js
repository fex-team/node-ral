/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2016/06/21
 */

/*global before*/
/* eslint-disable max-nested-callbacks, no-console */
/* eslint-disable fecs-camelcase, camelcase */
/* eslint-disable no-wrap-func */

'use strict';

var ral = require('../lib/ral.js');
var ralP = require('../lib/promise.js');
var path = require('path');
var server = require('./ral/server.js');
var EE = require('events').EventEmitter;

var isInited = new EE();

describe('issues', function () {
    var servers = [];

    beforeEach(function () {
        servers.push(server.oddFail(8192));
        servers.push(server.oddFail(8193));
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

    it('should init successfully', function () {
        ral.init({
            confDir: path.join(__dirname, './issues'),
            logger: {
                log_path: path.join(__dirname, '../logs'),
                app: 'yog-ral'
            }
        });
        isInited.emit('done');
    });

    it('issue 24', function (done) {
        before(function (ok) {
            isInited.on('done', ok);
        });
        var req = ral('24');
        req.on('data', function (data) {
            data.should.eql('/?from=ral');
            done();
        });
        req.on('error', function (err) {
            err.should.eql(null);
            done();
        });
    });

    it('don\'t retry on same machine', function (done) {
        before(function (ok) {
            isInited.on('done', ok);
        });
        var req = ral('retry_on_same_machine', {
            beforeRequest: function (context) {
                return context;
            }
        });
        req.on('data', function (data) {
            throw new Error('should be failed')
        });
        req.on('error', function (err) {
            err.should.be.ok();
            done();
        });
    })

});
