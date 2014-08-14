/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/8
 */

'use strict';

var RAL = require('../lib/ral.js');
var path = require('path');
var server = require('./ral/server.js');
var EE = require('events').EventEmitter;

var isInited = new EE();

describe('ral', function () {
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

    it('show raw request time', function(done){
        var body = '';
        var req = require('http').request('http://127.0.0.1:8192', function(res) {
            res.on('data',function(d){
                body += d;
            }).on('end', function(){
                var data = JSON.parse(body);
                data.port.should.be.eql(8192);
                done();
            });
        }).on('error', function(e) {
            e.should.not.be.ok;
        });
        req.end();
    });

    it('show request time with module request', function(done){
        require('request').get('http://127.0.0.1:8192', {} , function(err, response, body){
            (err === null).should.be.true;
            var data = JSON.parse(body);
            data.port.should.be.eql(8192);
            done();
        });
    });

    it('should init successfully', function () {
        RAL.init({
            confDir : __dirname + path.sep + './ral/config',
            logger : {
                "log_path" : __dirname + path.sep + '../logs',
                "app" : "yog-ral"
            },
            currentIDC : 'tc'
        });
        isInited.emit('done');
    });

    it('should make request correctly', function (done) {
        before(function( ok ){
            isInited.on('done', ok);
        });
        var req = RAL('GET_QS_SERV');
        req.on('data', function(data){
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
        req.on('data', function(data){
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
            var req_normal = RAL('GET_QS_SERV');
            req_normal.on('data', function(data){
                data.query.from.should.eql('ral');
                done();
            });
        });

    });

    it('should get large content correctly', function (done) {
        before(function( ok ){
            isInited.on('done', ok);
        });
        var req = RAL('GET_QS_SERV', {
            path: '/largecontent'
        });
        req.on('data', function(data){
            data.res.should.be.an.instanceOf(Object);
            done();
        });
        req.on('error', function(err){
            err.should.not.be.ok;
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

    it('should invoke timeout', function (done) {
        before(function( ok ){
            isInited.on('done', ok);
        });
        var req = RAL('GET_QS_SERV', {
            path: '/timeout',
            data: {
                msg: 'hi',
                name: 'timeout'
            },
            retry: 2,
            timeout: 100
        });
        req.on('data', function(data){
            console.log(data);
        });
        req.on('error', function(err){
            err.should.be.match(/request time out/);
            done();
        });
    });

    it('should make POST request with form data correctly', function (done) {
        before(function( ok ){
            isInited.on('done', ok);
        });
        var req = RAL('POST_QS_SERV', {
            data: {
                msg: 'hi',
                name: '何方石'
            }
        });
        req.on('data', function(data){
            servers.map(function(server){server.close()});
            [8192,8193].should.containEql(data.port);
            data.port.should.not.eql(8194);
            data.query.msg.should.eql('hi');
            data.query.name.should.eql('何方石');
            done();
        });
    });
});