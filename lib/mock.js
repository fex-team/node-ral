/**
 * @file mock
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2015/12/01
 *
 * Mock功能会读取用户指定的Mock文件夹 (与 Config 的模式一致)
 * 所有的用户请求参数都会传送给 Mock 文件，并执行用户指定的逻辑返回
 */

'use strict';
var ralUtil = require('./util.js');
var ctx = require('./ctx.js');
var path = require('path');
var _ = require('underscore');
var logger = require('./logger.js')('Mock');


/**
 * mock格式
 * {
 *     minRespTime: 100,
 *     maxRespTime: 300,
 *     respTime: 200,
 *     respTimeMethod: 'random|fixed',
 *     fatalRate: 0.5,
 *     fatalMessage: 'mock fatal hit'
 *     mock: function (options) {}
 * }
 */

function MockManager(options) {
    this.options = options;
    if (process.env.RAL_MOCK === 'true' || process.env.RAL_MOCK === '1') {
        ctx.RAL_MOCK_ALL = true;
    }
    else {
        ctx.RAL_MOCK = process.env.RAL_MOCK.split(',').reduce(function (prev, next) {
            prev[next] = true;
            return prev;
        }, {});
    }
    this.mockPool = {};
    this.loadMock();
}

MockManager.prototype.excuteMock = function (serviceName, options, cb) {
    if (!this.mockPool[serviceName] || (!ctx.RAL_MOCK_ALL && !ctx.RAL_MOCK[name] && !options.enableMock)) {
        return false;
    }
    var mock = this.mockPool[serviceName];
    var respTime = mock.respTime;
    if (mock.respTimeMethod === 'random') {
        respTime = mock.minRespTime + Math.floor(Math.random() * (mock.maxRespTime - mock.minRespTime));
    }
    setTimeout(function () {
        if (Math.random() < mock.fatalRate) {
            return cb(new Error(mock.fatalMessage));
        }
        if (mock.mock.length >= 2) {
            mock.mock(options, cb);
        }
        else {
            try {
                var data = mock.mock(options);
                cb(null, data);
            }
            catch (e) {
                cb(e);
            }
        }
    }, respTime);
    return true;
};

MockManager.prototype.loadMock = function () {
    var me = this;
    me.mockPool = {};
    var files = ralUtil.readdirWithEnvSync(me.options.path, ctx.env);
    files.map(function (filePath) {
        var ext = path.extname(filePath);
        var mock;
        if (ext === '.js') {
            logger.trace('load mock from ' + filePath);
            mock = require(filePath);
        }
        if (typeof mock === 'object') {
            for (var name in mock) {
                if (mock.hasOwnProperty(name) && mock[name].mock && typeof mock[name].mock === 'function') {
                    me.mockPool[name] = _.extend({
                        respTimeMethod: 'fixed',
                        minRespTime: 100,
                        maxRespTime: 500,
                        respTime: 0,
                        fatalRate: 0,
                        fatalMessage: 'mock fatal hit'
                    }, mock[name]);
                }
            }
        }
    });
};
