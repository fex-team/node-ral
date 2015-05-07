var ral = require('./ral.js');
var assert = require('assert');

ral('WEATHER', {
    // 指定SOAP method
    method: 'GetCityForecastByZIP',
    data: {
        ZIP: 10020 // 纽约的邮编
    }
}).on('data', function (data) {
    assert.equal(data.GetCityForecastByZIPResult.City, 'New York');
}).on('error', function (err) {
    assert.fail(err, null);
});