/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/8
 */

'use strict';

var RPC = require('../lib/rpc.js');
var path = require('path');

var EE = require('events').EventEmitter;

var isInited = new EE();

describe('rpc', function () {
    it('should init successfully', function (done) {
        RPC.init({
            confDir : __dirname + path.sep + './rpc/config',
            logger : {
                "log_path" : __dirname + path.sep + './logs',
                "app" : "rpc"
            },
            currentIDC : 'tc'
        }, function(err){
            (err === undefined).should.be.true;
            isInited.emit('done');
            done();
        });
    });

    it('should init successfully', function (done) {
        before(function( ok ){
            isInited.on('done', ok);
        });
        console.log(RPC);
        done();
    });
});