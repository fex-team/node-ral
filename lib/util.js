/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/8
 */

'use strict';

var _ = require('underscore');
var fs = require('fs');
var util = module.exports;

util.merge = function(source, target){
    if(_.isObject(source) && _.isObject(target)){
        _.map(target, function(value, key){
            source[key] = util.merge(source[key], value);
        });
    } else {
        source = target;
    }
    return source;
};

util.qs = function(object){
    var content = [];
    _.map(object, function(value, key){
        content.push(key+'='+value);
    });
    return content.join(' ')
};

util.readdirSync = function(dir) {
    var results = [];
    var list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        var stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(util.readdirSync(file));
        }
        else {
            results.push(file)
        }
    });
    return results
};
