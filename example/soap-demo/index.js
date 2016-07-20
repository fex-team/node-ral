/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2015/5/10
 */

'use strict';

var ralP = require('./ral.js');
var assert = require('assert');

ralP('WEATHER', {
    // 指定SOAP method
    method: 'GetCityForecastByZIP',
    data: {
        ZIP: 10020 // 纽约的邮编
    }
}).then(function (data) {
    assert.equal(data.GetCityForecastByZIPResult.City, 'New York');
}).catch(function (err) {
    assert.fail(err, null);
});
