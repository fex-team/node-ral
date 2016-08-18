/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/5
 */

/* eslint-disable no-wrap-func, max-nested-callbacks */

'use strict';

var logger = require('../lib/logger.js')('ConverterTest');
var Converter = require('../lib/converter.js');
var JsonConverter = require('../lib/ext/converter/jsonConverter.js');
var StringConverter = require('../lib/ext/converter/stringConverter.js');
var FormDataConverter = require('../lib/ext/converter/formDataConverter.js');
var StreamConverter = require('../lib/ext/converter/streamConverter.js');
var HttpProtocol = require('../lib/ext/protocol/httpProtocol.js');
var FormConverter = require('../lib/ext/converter/formConverter.js');
var QueryStringConverter = require('../lib/ext/converter/querystringConverter.js');
var RawConverter = require('../lib/ext/converter/rawConverter.js');
var RedisConverter = require('../lib/ext/converter/redisConverter.js');
var util = require('../lib/util.js');
var _ = require('underscore');
var postTest = require('./protocol/http_protocol_post_test.js');
var FormDataCls = require('form-data');

var mockUTF8Context = {
    encoding: 'utf8'
};

var mockGBKContext = {
    encoding: 'gbk'
};

var mockBlahContext = {
    encoding: 'blah'
};

logger.debug('start');

describe('converter', function () {
    it('should fail when get name', function () {
        var converter = new Converter();
        (function () {
            converter.getName();
        }).should.be.throw(/Not Implemented/);
    });

    it('has right catagory', function () {
        var converter = new Converter();
        converter.getCategory().should.be.equal('converter');
    });

    it('pack should fail', function () {
        var converter = new Converter();
        var data = null;
        (function () {
            converter.pack(mockBlahContext, data);
        }).should.throwError();
    });

    it('unpack should fail', function () {
        var converter = new Converter();
        var data = null;
        (function () {
            converter.unpack(mockBlahContext, data);
        }).should.throwError();
    });
});

describe('json converter', function () {
    it('has right name', function () {
        var jsonConverter = new JsonConverter();
        jsonConverter.getName().should.be.equal('json');
    });

    it('has right catagory', function () {
        var converter = new JsonConverter();
        converter.getCategory().should.be.equal('converter');
    });

    it('pack and unpack should be paired', function () {
        var jsonConverter = new JsonConverter();
        var data = {
            a: 1,
            b: '张三'
        };
        var options = _.clone(mockUTF8Context);
        var pack = jsonConverter.pack(options, data);
        var unpack = jsonConverter.unpack(_.clone(mockUTF8Context), pack);
        data.should.be.eql(unpack);
        options.headers['Content-Length'].should.be.eql(20);
    });

    it('unpack a string pack should throw error', function () {
        var converter = new StringConverter();
        var jsonConverter = new JsonConverter();
        var data = '张三李四';
        var pack = converter.pack(_.clone(mockUTF8Context), data);
        (function () {
            jsonConverter.unpack(_.clone(mockUTF8Context), pack);
        }).should.throwError();
    });

    it('pack and unpack gbk correctly', function () {
        var jsonConverter = new JsonConverter();
        var data = {
            a: 1,
            b: '张三'
        };
        var options = _.clone(mockGBKContext);
        var pack = jsonConverter.pack(options, data);
        var unpack = jsonConverter.unpack(_.clone(mockGBKContext), pack);
        data.should.be.eql(unpack);
        options.headers['Content-Length'].should.be.eql(18);
    });

    it('pack and unpack could skip header', function () {
        var jsonConverter = new JsonConverter();
        var data = {
            a: 1,
            b: '张三'
        };
        var options = _.clone(mockGBKContext);
        options.skipContentLength = true;
        var pack = jsonConverter.pack(options, data);
        var unpack = jsonConverter.unpack(_.clone(mockGBKContext), pack);
        data.should.be.eql(unpack);
        (options.headers === undefined).should.be.true;
    });

    it('pack should fail if encoding is illegal', function () {
        var converter = new JsonConverter();
        var data = null;
        (function () {
            converter.pack(_.clone(mockBlahContext), data);
        }).should.throwError();
    });

    it('pack should work if data is null', function () {
        var jsonConverter = new JsonConverter();
        var data = null;
        (function () {
            jsonConverter.pack(_.clone(mockUTF8Context), data);
        }).should.not.throwError();
    });
});

describe('string converter', function () {
    it('has right name', function () {
        var converter = new StringConverter();
        converter.getName().should.be.equal('string');
    });

    it('has right catagory', function () {
        var converter = new StringConverter();
        converter.getCategory().should.be.equal('converter');
    });

    it('pack and unpack should be paired', function () {
        var converter = new StringConverter();
        var data = '张三李四';
        var options = _.clone(mockUTF8Context);
        var pack = converter.pack(options, data);
        var unpack = converter.unpack(_.clone(mockUTF8Context), pack);
        data.should.be.eql(unpack);
        options.headers['Content-Length'].should.be.eql(12);
    });

    it('pack and unpack gbk correctly', function () {
        var converter = new StringConverter();
        var data = '张三李四';
        var options = _.clone(mockGBKContext);
        var pack = converter.pack(options, data);
        var unpack = converter.unpack(_.clone(mockGBKContext), pack);
        data.should.be.eql(unpack);
        options.headers['Content-Length'].should.be.eql(8);
    });

    it('pack and unpack could skip header', function () {
        var converter = new StringConverter();
        var data = '张三李四';
        var options = _.clone(mockGBKContext);
        options.skipContentLength = true;
        var pack = converter.pack(options, data);
        var unpack = converter.unpack(_.clone(mockGBKContext), pack);
        data.should.be.eql(unpack);
        (options.headers === undefined).should.be.true;
    });

    it('pack should fail if encoding is illegal', function () {
        var converter = new StringConverter();
        var data = null;
        (function () {
            converter.pack(_.clone(mockBlahContext), data);
        }).should.throwError();
    });

    it('pack should work if data is null', function () {
        var converter = new StringConverter();
        var data = null;
        (function () {
            converter.pack(_.clone(mockUTF8Context), data);
        }).should.not.throwError();
    });
});

describe('formdata converter', function () {
    it('has right name', function () {
        var converter = new FormDataConverter();
        converter.getName().should.be.equal('formdata');
    });

    it('has right catagory', function () {
        var converter = new FormDataConverter();
        converter.getCategory().should.be.equal('converter');
    });

    it('pack should work fine', function (done) {
        var converter = new FormDataConverter();
        var data = {
            name: '张三李四'
        };
        var options = _.clone(mockUTF8Context);
        var httpProtocol = new HttpProtocol();
        var server = postTest.createServer();
        util.merge(options, postTest.service);
        options = HttpProtocol.normalizeConfig(options);
        var pack = converter.pack(options, data);
        util.merge(options, {
            server: postTest.request.server
        });
        var request = httpProtocol.talk(options, function (res) {
            res.on('end', function (data2) {
                server.close();
                data2.toString().should.be.match(/hear you 张三李四.*end$/);
                done();
            });
            res.on('error', function () {
                server.close();
            });
        });
        pack.pipe(request);
    });

    it('pack gbk correctly', function (done) {
        var converter = new FormDataConverter();
        var data = {
            name: '张三李四'
        };
        var options = _.clone(mockGBKContext);
        var httpProtocol = new HttpProtocol();
        util.merge(options, postTest.service);
        util.merge(options, {
            server: postTest.request.server
        });
        options = HttpProtocol.normalizeConfig(options);
        var server = postTest.createServer('gbk');
        var pack = converter.pack(options, data);
        var request = httpProtocol.talk(options, function (res) {
            res.on('end', function (data2) {
                server.close();
                data2.toString().should.be.match(/hear you �������.*end$/);
                done();
            });
            res.on('error', function () {
                server.close();
            });
        });
        pack.pipe(request);
    });

    it('pack should fail if encoding is illegal', function () {
        var converter = new FormDataConverter();
        var data = {
            name: 'hefangshi'
        };
        (function () {
            converter.pack(mockBlahContext, data);
        }).should.throwError();
    });

    it('pack should work if data is null', function () {
        var converter = new FormDataConverter();
        var data = null;
        (function () {
            converter.pack(mockUTF8Context, data);
        }).should.not.throwError();
    });

    it('syncLength should send content-length', function () {
        var converter = new FormDataConverter();
        var data = {
            name: '张三李四'
        };
        var options = _.clone(mockUTF8Context);
        options.syncLength = true;
        // var httpProtocol = new HttpProtocol();
        util.merge(options, postTest.service);
        options = HttpProtocol.normalizeConfig(options);
        converter.pack(options, data);
        options.headers['Content-Length'].should.be.eql(169);
    });
});

describe('form converter', function () {
    it('has right name', function () {
        var converter = new FormConverter();
        converter.getName().should.be.equal('form');
    });

    it('has right catagory', function () {
        var converter = new FormConverter();
        converter.getCategory().should.be.equal('converter');
    });

    it('pack and unpack should be paired', function () {
        var converter = new FormConverter();
        var data = {
            a: '1',
            b: '张三'
        };
        var pack = converter.pack(mockUTF8Context, data);
        var unpack = converter.unpack(mockUTF8Context, pack);
        data.should.be.eql(unpack);
    });

    it('pack and unpack gbk correctly', function () {
        var converter = new FormConverter();
        var data = {
            a: '1',
            b: '张三'
        };
        var pack = converter.pack(mockGBKContext, data);
        var unpack = converter.unpack(mockGBKContext, pack);
        data.should.be.eql(unpack);

    });

    it('pack should work if data is null', function () {
        var converter = new FormConverter();
        var data = null;
        (function () {
            converter.pack(mockUTF8Context, data);
        }).should.not.throwError();
    });

    it('pack should work fine', function (done) {
        var converter = new FormConverter();
        var data = {
            name: '张三李四'
        };
        var options = _.clone(mockUTF8Context);
        var httpProtocol = new HttpProtocol();
        util.merge(options, postTest.service);
        util.merge(options, postTest.request);
        options = HttpProtocol.normalizeConfig(options);
        var pack = converter.pack(options, data);
        var server = postTest.createServer();
        options.payload = pack;
        httpProtocol.talk(options, function (res) {
            res.on('end', function (resData) {
                server.close();
                resData.toString().should.be.match(/hear you 张三李四.*end$/);
                done();
            });
        });
    });
});

describe('querystring converter', function () {
    it('has right name', function () {
        var converter = new QueryStringConverter();
        converter.getName().should.be.equal('querystring');
    });

    it('has right catagory', function () {
        var converter = new QueryStringConverter();
        converter.getCategory().should.be.equal('converter');
    });

    it('pack should change query', function () {
        var converter = new QueryStringConverter();
        var data = {
            a: '1',
            b: '张三'
        };
        converter.pack(mockUTF8Context, data);
        mockUTF8Context.query.should.be.eql(data);
    });

    it('unpack should work with urlencodeConverter', function () {
        var converter = new QueryStringConverter();
        var urlencodeConverter = new FormConverter();
        var data = {
            a: '1',
            b: '张三'
        };
        var pack = urlencodeConverter.pack(mockUTF8Context, data);
        var unpack = converter.unpack(mockUTF8Context, pack);
        data.should.be.eql(unpack);
    });
});

describe('raw converter', function () {
    it('has right name', function () {
        var converter = new RawConverter();
        converter.getName().should.be.equal('raw');
    });

    it('has right catagory', function () {
        var converter = new RawConverter();
        converter.getCategory().should.be.equal('converter');
    });

    it('pack and unpack should be paired', function () {
        var converter = new RawConverter();
        var data = new Buffer('abc');
        var pack = converter.pack({}, data);
        var unpack = converter.unpack({}, pack);
        unpack.toString().should.be.eql('abc');
    });
});

describe('redis converter', function () {
    it('has right name', function () {
        var converter = new RedisConverter();
        converter.getName().should.be.equal('redis');
    });

    it('has right catagory', function () {
        var converter = new RedisConverter();
        converter.getCategory().should.be.equal('converter');
    });

    it('direct pass array data', function () {
        var converter = new RedisConverter();
        var data = ['a', 'b'];
        var pack = converter.pack({}, data);
        pack.should.be.eql(['a', 'b']);
    });

    it('convert key value to array data', function () {
        var converter = new RedisConverter();
        var data = {
            key: 'foo',
            value: 'bar'
        };
        var pack = converter.pack({}, data);
        pack.should.be.eql(['foo', 'bar']);
    });

    it('convert multi value', function () {
        var converter = new RedisConverter();
        var data = {
            key: 'foo',
            value: ['bar1', 'bar2']
        };
        var pack = converter.pack({}, data);
        pack.should.be.eql(['foo', 'bar1', 'bar2']);
    });

    it('convert array value in multi value', function () {
        var converter = new RedisConverter();
        var data = {
            key: 'foo',
            value: [['bar1'], 'bar2']
        };
        var pack = converter.pack({}, data);
        pack.should.be.eql(['foo', ['bar1'], 'bar2']);
    });

    it('only use key', function () {
        var converter = new RedisConverter();
        var data = {
            key: 'foo'
        };
        var pack = converter.pack({}, data);
        pack.should.be.eql(['foo']);
    });

    it('use raw key', function () {
        var converter = new RedisConverter();
        var data = 'foo';
        var pack = converter.pack({}, data);
        pack.should.be.eql(['foo']);
    });

    it('invalid param', function () {
        var converter = new RedisConverter();
        var data = {
            foo: 'bar'
        };
        try {
            var pack = converter.pack({}, data);
            (pack === null).should.be.ok;
        } catch (e) {
            e.should.be.ok;
        }
    });
});

describe('stream converter', function () {
    it('has right name', function () {
        var converter = new StreamConverter();
        converter.getName().should.be.equal('stream');
    });

    it('has right catagory', function () {
        var converter = new StreamConverter();
        converter.getCategory().should.be.equal('converter');
    });

    it('pack should work fine', function (done) {
        var converter = new StreamConverter();
        var form = new FormDataCls();
        form.append('name', '张三李四');
        var options = _.clone(mockUTF8Context);
        var httpProtocol = new HttpProtocol();
        var server = postTest.createServer();
        util.merge(options, postTest.service);
        options = HttpProtocol.normalizeConfig(options);
        var pack = converter.pack(options, form);
        util.merge(options, {
            server: postTest.request.server
        });
        options.headers = {};
        options.headers['Content-Type'] = 'multipart/form-data;boundary=' + form.getBoundary();
        var request = httpProtocol.talk(options, function (res) {
            res.on('end', function (data) {
                server.close();
                data.toString().should.be.match(/hear you 张三李四.*end$/);
                done();
            });
            res.on('error', function () {
                server.close();
            });
        });
        pack.pipe(request);
    });
});
