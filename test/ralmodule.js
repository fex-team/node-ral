/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/8
 */

'use strict';

var RalModule = require('../lib/ralmodule.js');
var path = require('path');

describe('ralmodule', function () {
    it('should load ext successfuly', function () {
        RalModule.load(__dirname + path.sep + '../lib/ext');
        RalModule.modules.balance.random.should.be.ok;
        RalModule.modules.balance.roundrobin.should.be.ok;

        RalModule.modules.converter.form.should.be.ok;
        RalModule.modules.converter.json.should.be.ok;
        RalModule.modules.converter.string.should.be.ok;
        RalModule.modules.converter.formdata.should.be.ok;

        RalModule.modules.protocol.http.should.be.ok;
    });
});
