/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/8
 */

/* eslint-disable no-wrap-func */

'use strict';

var RalModule = require('../lib/ralmodule.js');
var path = require('path');
var util = require('util');

describe('ralmodule', function () {
    it('should load ext successfuly', function () {
        RalModule.load(path.join(__dirname, '../lib/ext'));
        RalModule.modules.balance.random.should.be.ok;
        RalModule.modules.balance.roundrobin.should.be.ok;

        RalModule.modules.converter.form.should.be.ok;
        RalModule.modules.converter.json.should.be.ok;
        RalModule.modules.converter.string.should.be.ok;
        RalModule.modules.converter.formdata.should.be.ok;

        RalModule.modules.protocol.http.should.be.ok;
    });

    it('should skip modules not inherit RalModule', function () {
        RalModule.load({
            getCategory: function () {
                return 'a';
            }
        });
        RalModule.load({
            getCategory: function () {
                return 'b';
            },
            getName: function () {
                return 'c';
            }
        });
        (RalModule.modules.a === undefined).should.be.true;
        (RalModule.modules.b === undefined).should.be.false;
    });

    it('should throw error for unimplemented ralmodule', function () {
        function mock() {
            RalModule.call(this);
        }
        util.inherits(mock, RalModule);
        (function () {
            mock.getName();
        }).should.throwError();
        (function () {
            mock.getCategory();
        }).should.throwError();
    });

});
