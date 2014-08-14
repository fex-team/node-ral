/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/5
 */

'use strict';

var logger = require('../lib/logger.js')('ConverterTest');
var Converter = require('../lib/converter.js');
var JsonConverter = require('../lib/ext/converter/jsonConverter.js');
var StringConverter = require('../lib/ext/converter/stringConverter.js');
var FormConverter = require('../lib/ext/converter/formConverter.js');
var HttpProtocol = require('../lib/ext/protocol/httpProtocol.js');
var UrlEncodeConverter = require('../lib/ext/converter/urlencodeConverter.js');
var QueryStringConverter = require('../lib/ext/converter/querystringConverter.js');
var RawConverter = require('../lib/ext/converter/rawConverter.js');
var util = require('../lib/util.js');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var post_test = require('./protocol/http_protocol_post_test.js');

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
            b: "张三"
        };
        var pack = jsonConverter.pack(mockUTF8Context, data);
        var unpack = jsonConverter.unpack(mockUTF8Context, pack);
        data.should.be.eql(unpack);
    });

    it('unpack a string pack should throw error', function () {
        var converter = new StringConverter();
        var jsonConverter = new JsonConverter();
        var data = '张三李四';
        var pack = converter.pack(mockUTF8Context, data);
        (function(){jsonConverter.unpack(mockUTF8Context, pack);}).should.throwError();
    });

    it('pack and unpack gbk correctly', function () {
        var jsonConverter = new JsonConverter();
        var data = {
            a: 1,
            b: "张三"
        };
        var pack = jsonConverter.pack(mockGBKContext, data);
        var unpack = jsonConverter.unpack(mockGBKContext, pack);
        data.should.be.eql(unpack);
    });

    it('pack should fail if encoding is illegal', function () {
        var converter = new JsonConverter();
        var data = null;
        (function () {
            converter.pack(mockBlahContext, data);
        }).should.throwError();
    });

    it('pack should work if data is null', function () {
        var jsonConverter = new JsonConverter();
        var data = null;
        (function () {
            jsonConverter.pack(mockUTF8Context, data);
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
        var pack = converter.pack(mockUTF8Context, data);
        var unpack = converter.unpack(mockUTF8Context, pack);
        data.should.be.eql(unpack);
    });

    it('pack and unpack gbk correctly', function () {
        var converter = new StringConverter();
        var data = '张三李四';
        var pack = converter.pack(mockGBKContext, data);
        var unpack = converter.unpack(mockGBKContext, pack);
        data.should.be.eql(unpack);
    });

    it('pack should fail if encoding is illegal', function () {
        var converter = new StringConverter();
        var data = null;
        (function () {
            converter.pack(mockBlahContext, data);
        }).should.throwError();
    });

    it('pack should work if data is null', function () {
        var converter = new StringConverter();
        var data = null;
        (function () {
            converter.pack(mockUTF8Context, data);
        }).should.not.throwError();
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

    it('pack should work fine', function (done) {
        var converter = new FormConverter();
        var data = {
            name: '张三李四'
        };
        var options = _.clone(mockUTF8Context);
        var httpProtocol = new HttpProtocol();
        var server = post_test.createServer();
        util.merge(options, post_test.service);
        options = HttpProtocol.normalizeConfig(options);
        var pack = converter.pack(options, data);
        util.merge(options, {
            server: post_test.request.server
        });
        var request = httpProtocol.talk(options);
        var response = '';
        request.on('data', function (data) {
            response += data.toString();
        });
        request.on('end', function () {
            server.close();
            response.toString().should.be.equal('hear you 张三李四');
            done();
        });
        pack.pipe(request);
    });

    it('pack gbk correctly', function (done) {
        var converter = new FormConverter();
        var data = {
            name: '张三李四'
        };
        var options = _.clone(mockGBKContext);
        var httpProtocol = new HttpProtocol();
        util.merge(options, post_test.service);
        util.merge(options, {
            server: post_test.request.server
        });
        options = HttpProtocol.normalizeConfig(options);
        var server = post_test.createServer('gbk');
        var pack = converter.pack(options, data);
        var request = httpProtocol.talk(options);
        var response = '';
        request.on('data', function (data) {
            response += data.toString();
        });
        request.on('end', function () {
            response.toString().should.be.equal('hear you 张三李四');
            server.close();
            done();
        });
        pack.pipe(request);
    });

    it('pack should fail if encoding is illegal', function () {
        var converter = new FormConverter();
        var data = {
            name: "hefangshi"
        };
        (function () {
            converter.pack(mockBlahContext, data);
        }).should.throwError();
    });

    it('pack should work if data is null', function () {
        var converter = new FormConverter();
        var data = null;
        (function () {
            converter.pack(mockUTF8Context, data);
        }).should.not.throwError();
    });
});

describe('urlencode converter', function () {
    it('has right name', function () {
        var converter = new UrlEncodeConverter();
        converter.getName().should.be.equal('urlencode');
    });

    it('has right catagory', function () {
        var converter = new UrlEncodeConverter();
        converter.getCategory().should.be.equal('converter');
    });

    it('pack and unpack should be paired', function () {
        var converter = new UrlEncodeConverter();
        var data = {
            a: 1,
            b: "张三"
        };
        var pack = converter.pack(mockUTF8Context, data);
        var unpack = converter.unpack(mockUTF8Context, pack);
        data.should.be.eql(unpack);
    });

    it('pack and unpack gbk correctly', function () {
        var converter = new UrlEncodeConverter();
        var data = {
            a: 1,
            b: "张三"
        };
        var pack = converter.pack(mockGBKContext, data);
        var unpack = converter.unpack(mockGBKContext, pack);
        data.should.be.eql(unpack);

    });

    it('pack should work if data is null', function () {
        var converter = new UrlEncodeConverter();
        var data = null;
        (function () {
            converter.pack(mockUTF8Context, data);
        }).should.not.throwError();
    });

    it('pack should work fine', function (done) {
        var converter = new UrlEncodeConverter();
        var data = {
            name: '张三李四'
        };
        var options = _.clone(mockUTF8Context);
        var httpProtocol = new HttpProtocol();
        util.merge(options, post_test.service);
        util.merge(options, post_test.request);
        options = HttpProtocol.normalizeConfig(options);
        var pack = converter.pack(options, data);
        var server = post_test.createServer();
        options.payload = pack;
        var request = httpProtocol.talk(options);
        var response = '';
        request.on('data', function (data) {
            response += data.toString();
        });
        request.on('end', function () {
            server.close();
            response.toString().should.be.equal('hear you 张三李四');
            done();
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

    it('pack should change headers and query', function () {
        var converter = new QueryStringConverter();
        var data = {
            a: 1,
            b: "张三"
        };
        converter.pack(mockUTF8Context, data);
        mockUTF8Context.headers['Content-Type'].should.be.eql('application/json');
        mockUTF8Context.query.should.be.eql(data);
    });

    it('unpack should work with urlencodeConverter', function () {
        var converter = new QueryStringConverter();
        var urlencodeConverter = new UrlEncodeConverter();
        var data = {
            a: 1,
            b: "张三"
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

    it('pack and unpack should be paired', function (done) {
        var converter = new RawConverter();
        var data = fs.createReadStream(__dirname + path.sep + './converter.js');
        var pack = converter.pack({}, data);
        var unpack = converter.unpack({}, pack);
        var body = '';
        unpack.on('data', function (data) {
            body += data;
        });
        unpack.on('end', function () {
            fs.readFileSync(__dirname + path.sep + './converter.js').toString().should.be.eql(body);
            done();
        });
    });
});