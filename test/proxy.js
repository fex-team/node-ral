/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2016/3/24
 */

/*global before*/
/* eslint-disable max-nested-callbacks, no-console */
/* eslint-disable fecs-camelcase, camelcase */
/* eslint-disable no-wrap-func */


var ral = require('../lib/ral.js');
var ralP = require('../lib/promise.js');
var config = require('../lib/config.js');
var path = require('path');
var server = require('./ral/server.js');
var EE = require('events').EventEmitter;

var isInited = new EE();
describe('proxy', function () {


    it('should init successfully', function () {
        config.clearConf();
        ral.init({
            confDir: path.join(__dirname, './ral/config'),
            logger: {
                log_path: path.join(__dirname, '../logs'),
                app: 'yog-ral'
            },
            currentIDC: 'tc'
        });
        isInited.emit('done');
    });


    (process.env.TEST_PROXY ? it : it.skip)('proxy with http', function (done) {
        ral('GET_QS_SERV', {
            url: 'http://hiphotos.baidu.com/lvpics/abpic/item/91ae68c655434b439c163d22.jpg',
            rejectUnauthorized: false,
            ignoreStatusCode: true,
            includeExtras: true,
            proxy: 'http://10.36.3.163:8080',
            pack: 'querystring',
            unpack: 'raw',
            encoding: 'utf-8',
            query: '',
            method: 'GET',
            headers: {
                'User-Agent': 'node-ral',
            }
        }).on('data', function (data) {
            data.length.should.be.eql(10202);
            done();
        }).on('error', function (err) {
            console.error(err);
            (err == null).should.be.true;
            done();
        });
    });

    (process.env.TEST_PROXY ? it : it.skip)('proxy with orp https', function (done) {
        ral('GET_QS_SERV', {
            url: 'http://ss0.bdstatic.com:443/7LsWdDW5_xN3otqbppnN2DJv/lvpics/abpic/item/91ae68c655434b439c163d22.jpg',
            rejectUnauthorized: false,
            ignoreStatusCode: true,
            includeExtras: true,
            proxy: 'http://10.36.3.163:8443',
            pack: 'querystring',
            unpack: 'raw',
            encoding: 'utf-8',
            query: '',
            method: 'GET',
            headers: {
                'User-Agent': 'node-ral',
                'Accept-Encoding': ''
            }
        }).on('data', function (data) {
            data.length.should.be.eql(9363);
            done();
        }).on('error', function (err) {
            console.error(err);
            (err == null).should.be.true;
            done();
        });
    });
});
