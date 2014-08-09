/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/8
 */

'use strict';

var RAL = require('../lib/ral.js');
var path = require('path');
var server = require('./rpc/server.js');
var EE = require('events').EventEmitter;

var isInited = new EE();

describe('rpc', function () {
    var servers = [];

    beforeEach(function(){
        servers.push(server.bookService(8192));
        servers.push(server.bookService(8193));
        servers.push(server.bookService(8194));
    });

    afterEach(function(){
        servers.map(function(server){try{server.close()}catch(e){}});
        servers = [];
    });

    it('should init successfully', function (done) {
        RAL.init({
            confDir : __dirname + path.sep + './rpc/config',
            logger : {
                "log_path" : __dirname + path.sep + './logs',
                "app" : "rpc"
            },
            currentIDC : 'tc'
        }, function(err){
            (err === undefined).should.be.true;
            isInited.emit('done');
            done();
        });
    });

    it('should make request correctly', function (done) {
        before(function( ok ){
            isInited.on('done', ok);
        });
        var req = RAL('GET_QS_SERV');
        req.on('end', function(data){
            [8192,8193].should.containEql(data.port);
            data.port.should.not.eql(8194);
            data.query.from.should.eql('ral');
            done();
        });
    });

    it('should make request with data correctly', function (done) {
        before(function( ok ){
            isInited.on('done', ok);
        });
        var req = RAL('GET_QS_SERV', {
            data: {
                msg: 'hi',
                name: '何方石'
            }
        });
        req.on('end', function(data){
            servers.map(function(server){server.close()});
            [8192,8193].should.containEql(data.port);
            data.port.should.not.eql(8194);
            data.query.from.should.eql('ral');
            data.query.msg.should.eql('hi');
            data.query.name.should.eql('何方石');
            done();
        });
    });

    it('should override the options correctly', function (done) {
        before(function( ok ){
            isInited.on('done', ok);
        });
        var req = RAL('GET_QS_SERV', {
            path : '/404'
        });
        req.on('error', function(err){
            err.toString().should.be.match(/404/);
            done();
        });
    });

    it('should report unpack error', function (done) {
        before(function( ok ){
            isInited.on('done', ok);
        });
        var req = RAL('GET_QS_SERV', {
            data: {
                msg: 'hi'
            },
            encoding: 'blah'
        });
        req.on('error', function(err){
            err.toString().should.be.match(/Encoding/);
            done();
        });
    });
});