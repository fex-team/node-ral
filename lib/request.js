/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/6
 */

'use strict';

/**
 *
 * @constructor
 */
function Request(server, payload, options){
    this.payload = payload;
    this.server = server;
    this.options = options;
}

module.exports = Request;