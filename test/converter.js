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


var mockUTF8Context = new ConverterContext('mockUTF8', {
    encoding: 'utf8'
});

var mockGBKContext = new ConverterContext('mockGBK', {
    encoding: 'gbk'
});

var mockBlahContext = new ConverterContext('mockBlah', {
    encoding: 'blah'
});


describe('json converter', function() {
    it('has right name', function(){
        var jsonConverter = new JsonConverter();
        jsonConverter.getName().should.be.equal('json');
    });

    it('pack and unpack should be paired', function() {
        var jsonConverter = new JsonConverter();
        var data = {
            a: 1,
            b: "张三"
        };
        var buffer = jsonConverter.pack(mockUTF8Context, data);
        var unpackData = jsonConverter.unpack(mockUTF8Context, buffer);
        data.should.be.eql(unpackData);
    });

    it('pack and unpack gbk correctly', function() {
        var jsonConverter = new JsonConverter();
        var data = {
            a: 1,
            b: "张三"
        };
        var buffer = jsonConverter.pack(mockGBKContext, data);
        var unpackData = jsonConverter.unpack(mockGBKContext, buffer);
        data.should.be.eql(unpackData);
    });

    it('pack should fail if encoding is illegal', function() {
        var jsonConverter = new JsonConverter();
        var data = null;
        (function(){jsonConverter.pack(mockBlahContext, data);}).should.throwError();
    });
});

describe('string converter', function() {
    it('has right name', function(){
        var converter = new StringConverter();
        converter.getName().should.be.equal('string');
    });

    it('pack and unpack should be paired', function() {
        var converter = new StringConverter();
        var data = '张三李四';
        var buffer = converter.pack(mockUTF8Context, data);
        var unpackData = converter.unpack(mockUTF8Context, buffer);
        data.should.be.eql(unpackData);
    });

    it('pack and unpack gbk correctly', function() {
        var converter = new StringConverter();
        var data = '张三李四';
        var buffer = converter.pack(mockGBKContext, data);
        var unpackData = converter.unpack(mockGBKContext, buffer);
        data.should.be.eql(unpackData);
    });

    it('pack should fail if encoding is illegal', function() {
        var converter = new StringConverter();
        var data = null;
        (function(){converter.pack(mockBlahContext, data);}).should.throwError();
    });

    it('pack should fail if data is null', function() {
        var converter = new StringConverter();
        var data = null;
        (function(){converter.pack(mockUTF8Context, data);}).should.throwError();
    });
});