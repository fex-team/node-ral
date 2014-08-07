/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/5
 */

'use strict';

var Converter = require('../lib/converter.js').Converter;
var ConverterContext = require('../lib/converter.js').ConverterContext;
var JsonConverter = require('../lib/ext/converter/jsonConverter.js');
var StringConverter = require('../lib/ext/converter/stringConverter.js');
var FormConverter = require('../lib/ext/converter/formConverter.js');
var HttpProtocol = require('../lib/ext/protocol/httpProtocol.js');
var UrlEncodeConverter = require('../lib/ext/converter/urlencodeConverter.js');
var HttpProtocolContext = require('../lib/ext/protocol/httpProtocol.js').HttpProtocolContext;

var mockUTF8Context = new ConverterContext('mockUTF8', {
    encoding: 'utf8'
});

var mockGBKContext = new ConverterContext('mockGBK', {
    encoding: 'gbk'
});

var mockBlahContext = new ConverterContext('mockBlah', {
    encoding: 'blah'
});

describe('converter', function(){
   it('should fail when get name', function(){
       var converter = new Converter();
       (function(){converter.getName();}).should.be.throw(/Not Implemented/);
   });

    it('should get context class', function(){
        var converter = new Converter();
        converter.getContext().should.be.equal(ConverterContext);
    });
});

describe('json converter', function() {
    it('has right name', function(){
        var jsonConverter = new JsonConverter();
        jsonConverter.getName().should.be.equal('json');
    });

    it('has right context class', function(){
        var converter = new StringConverter();
        converter.getContext().should.be.equal(ConverterContext);
    });

    it('pack and unpack should be paired', function(done) {
        var jsonConverter = new JsonConverter();
        var data = {
            a: 1,
            b: "张三"
        };
        var pack = jsonConverter.pack(mockUTF8Context, data);
        var unpack = jsonConverter.unpack(mockUTF8Context);
        unpack.on('end', function(unpackData){
            data.should.be.eql(unpackData);
            done();
        });
        pack.pipe(unpack);
    });

    it('pack and unpack gbk correctly', function(done) {
        var jsonConverter = new JsonConverter();
        var data = {
            a: 1,
            b: "张三"
        };
        var pack = jsonConverter.pack(mockGBKContext, data);
        var unpack = jsonConverter.unpack(mockGBKContext);
        unpack.on('end', function(unpackData){
            data.should.be.eql(unpackData);
            done();
        });
        pack.pipe(unpack);
    });

    it('pack should work if data is null', function() {
        var jsonConverter = new JsonConverter();
        var data = null;
        (function(){jsonConverter.pack(mockUTF8Context, data);}).should.not.throwError();
    });
});

describe('string converter', function() {
    it('has right name', function(){
        var converter = new StringConverter();
        converter.getName().should.be.equal('string');
    });

    it('has right context class', function(){
        var converter = new StringConverter();
        converter.getContext().should.be.equal(ConverterContext);
    });

    it('pack and unpack should be paired', function(done) {
        var converter = new StringConverter();
        var data = '张三李四';
        var pack = converter.pack(mockUTF8Context, data);
        var unpack = converter.unpack(mockUTF8Context);
        unpack.on('end', function(unpackData){
            data.should.be.eql(unpackData);
            done();
        });
        pack.pipe(unpack);
    });

    it('pack and unpack gbk correctly', function(done) {
        var converter = new StringConverter();
        var data = '张三李四';
        var pack = converter.pack(mockGBKContext, data);
        var unpack = converter.unpack(mockGBKContext);
        unpack.on('end', function(unpackData){
            data.should.be.eql(unpackData);
            done();
        });
        pack.pipe(unpack);
    });

    it('pack should fail if encoding is illegal', function() {
        var converter = new StringConverter();
        var data = null;
        (function(){converter.pack(mockBlahContext, data);}).should.throwError();
    });

    it('pack should work if data is null', function() {
        var converter = new StringConverter();
        var data = null;
        (function(){converter.pack(mockUTF8Context, data);}).should.not.throwError();
    });
});

describe('form converter', function() {
    it('has right name', function(){
        var converter = new FormConverter();
        converter.getName().should.be.equal('form');
    });

    it('has right context class', function(){
        var converter = new FormConverter();
        converter.getContext().should.be.equal(ConverterContext);
    });

    it('pack should work fine', function(done) {
        var converter = new FormConverter();
        var data = {
            name: '张三李四'
        };
        var pack = converter.pack(mockUTF8Context, data);

        var httpProtocol = new HttpProtocol();
        var post_test = require('./protocol/http_protocol_post_test.js');
        var context = new HttpProtocolContext('mockHTTPService', post_test.service);
        var server = post_test.createServer();
        var rs = httpProtocol.talk(context, {
            payload: pack,
            server: post_test.request.server
        });
        var response = '';
        rs.on('data', function(data){
            response += data.toString();
        });
        rs.on('end', function(){
            response.toString().should.be.equal('hear you 张三李四');
            server.close();
            done();
        });
    });

    it('pack gbk correctly', function(done) {
        var converter = new FormConverter();
        var data = {
            name: '张三李四'
        };
        var pack = converter.pack(mockGBKContext, data);

        var httpProtocol = new HttpProtocol();
        var post_test = require('./protocol/http_protocol_post_test.js');
        var context = new HttpProtocolContext('mockHTTPService', post_test.service);
        var server = post_test.createServer('gbk');
        var rs = httpProtocol.talk(context, {
            payload: pack,
            server: post_test.request.server,
            options: {
                encoding: 'gbk'
            }
        });
        var response = '';
        rs.on('data', function(data){
            response += data.toString();
        });
        rs.on('end', function(){
            response.toString().should.be.equal('hear you 张三李四');
            server.close();
            done();
        });
    });

    it('pack should fail if encoding is illegal', function() {
        var converter = new FormConverter();
        var data = {
            name: "hefangshi"
        };
        (function(){converter.pack(mockBlahContext, data);}).should.throwError();
    });

    it('pack should work if data is null', function() {
        var converter = new FormConverter();
        var data = null;
        (function(){converter.pack(mockUTF8Context, data);}).should.not.throwError();
    });
});

describe('urlencode converter', function() {
    it('has right name', function(){
        var converter = new UrlEncodeConverter();
        converter.getName().should.be.equal('urlencode');
    });

    it('has right context class', function(){
        var converter = new UrlEncodeConverter();
        converter.getContext().should.be.equal(ConverterContext);
    });

    it('pack and unpack should be paired', function(done) {
        var converter = new UrlEncodeConverter();
        var data = {
            a: 1,
            b: "张三"
        };
        var pack = converter.pack(mockUTF8Context, data);
        var unpack = converter.unpack(mockUTF8Context);
        unpack.on('end', function(unpackData){
            data.should.be.eql(unpackData);
            done();
        });
        pack.pipe(unpack);
    });

    it('pack and unpack gbk correctly', function(done) {
        var converter = new UrlEncodeConverter();
        var data = {
            a: 1,
            b: "张三"
        };
        var pack = converter.pack(mockGBKContext, data);
        var unpack = converter.unpack(mockGBKContext);
        unpack.on('end', function(unpackData){
            data.should.be.eql(unpackData);
            done();
        });
        pack.pipe(unpack);
    });

    it('pack should work if data is null', function() {
        var converter = new UrlEncodeConverter();
        var data = null;
        (function(){converter.pack(mockUTF8Context, data);}).should.not.throwError();
    });

    it('pack should work fine', function(done) {
        var converter = new UrlEncodeConverter();
        var data = {
            name: '张三李四'
        };
        var pack = converter.pack(mockUTF8Context, data);

        var httpProtocol = new HttpProtocol();
        var post_test = require('./protocol/http_protocol_post_test.js');
        var context = new HttpProtocolContext('mockHTTPService', post_test.service);
        var server = post_test.createServer();
        var rs = httpProtocol.talk(context, {
            payload: pack,
            server: post_test.request.server
        });
        var response = '';
        rs.on('data', function(data){
            response += data.toString();
        });
        rs.on('end', function(){
            response.toString().should.be.equal('hear you 张三李四');
            server.close();
            done();
        });
    });
});