/**
 * @file timer
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/11
 */

'use strict';

var now = require('performance-now');

function Timer(preset) {
    this.context = {};
    var me = this;
    preset.forEach(function (key) {
        me.context[key] = {
            cost: 0
        };
    });
}

/**
 * start timer for a subjet
 *
 * @param  {string} name [description]
 */
Timer.prototype.start = function (name) {
    this.context[name] = this.context[name] || {
        cost: 0
    };
    this.context[name].start = now();
};

/**
 * end subject timer
 *
 * @param  {string} name  [description]
 */
Timer.prototype.end = function (name) {
    var timer = this.context[name];
    if (timer) {
        timer.end = now();
        timer.cost = timer.end - timer.start;
    }
};

module.exports = Timer;
