/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/5
 */

'use strict';

var Converter = require('../lib/converter.js').Converter;
var ConverterContext = require('../lib/converter.js').ConverterContext;
var JsonConverter = require('../lib/ext/converter/jsonConverter.js');

var mockUTF8Context = new ConverterContext('mockUTF8', {
    encoding: 'utf8'
});

var mockGBKContext = new ConverterContext('mockGBK', {
    encoding: 'gbk'
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
});