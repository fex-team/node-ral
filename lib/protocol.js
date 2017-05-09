/**
 * @file ral protocol base class
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/4
 */

'use strict';

// var logger = require('./logger.js')('Protocol');
var RalModule = require('./ralmodule.js');
var util = require('util');

function Procotol() {
    RalModule.call(this);
}

util.inherits(Procotol, RalModule);

Procotol.prototype.normalizeConfig = Procotol.normalizeConfig = function (context) {
    return context;
};

Procotol.prototype.beforeRequest = Procotol.beforeRequest = function (context) {
    if (context.beforeRequest && typeof context.beforeRequest === 'function') {
        context = context.beforeRequest(context);
        if (!context) {
            throw new Error('Request was canceled by beforeRequest hook since returned context was ' + context);
        }
    }
    return context;
};

/**
 * communicate with server, talk will return the request object to receive payload stream
 * the callback will return a response stream for unpack
 *
 * @param  {Object}   config   [description]
 * @param  {Function} callback [description]
 * @return {Object}            [description]
 */
Procotol.prototype.talk = function (config, callback) {
    config = this.beforeRequest(config);
    return this._request(config, callback);
};

Procotol.prototype.getCategory = function () {
    return 'protocol';
};

/**
 * actual request function, need to be implemented
 *
 * @param  {Object}   config   [description]
 * @param  {Function} callback [description]
 */
Procotol.prototype._request = function (config, callback) {
    throw new Error('Not Implemented');
};

module.exports = Procotol;
