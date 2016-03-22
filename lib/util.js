/**
 * @file util
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/8
 */

'use strict';

var _ = require('underscore');
var fs = require('fs');
var p = require('path');
var util = module.exports;

util.merge = function (source, target) {
    if (_.isObject(source) && _.isObject(target)) {
        _.map(target, function (value, key) {
            source[key] = util.merge(source[key], value);
        });
    }
    else {
        source = target;
    }
    return source;
};

/**
 * deepClone object with json parse
 * http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-an-object
 *
 * aware of DateTime won't be parse well when using this method
 *
 * @param  {Object} object [description]
 * @return {Object}        [description]
 */
util.deepClone = function (object) {
    return JSON.parse(JSON.stringify(object));
};

util.qs = function (object) {
    var content = [];
    _.map(object, function (value, key) {
        content.push(key + '=' + value);
    });
    return content.join(' ');
};

util.readdirSync = function (dir) {
    var results = [];
    var list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = dir + '/' + file;
        var stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(util.readdirSync(file));
        }
        else {
            results.push(file);
        }
    });
    return results;
};

util.readdirWithEnvSync = function (path, prefer) {
    var loaded = {};
    var files = [];
    util.readdirSync(path).forEach(function (subPath) {
        if (loaded[p.normalize(subPath)]) {
            return;
        }
        var ext = p.extname(subPath);
        var filePath = null;
        var basename = p.basename(subPath, ext);
        var subfix = p.extname(basename);
        var dirname = p.dirname(subPath);
        var confname = p.basename(basename, subfix);
        var confID = dirname + '/' + p.basename(basename, subfix) + '@' + prefer;
        if (basename[0] === '.' || loaded[confID]) {
            return;
        }

        function getPreferFile() {
            // check if prefer file is exist
            if (prefer) {
                var preferFile = dirname + p.sep + confname + '.' + prefer + ext;
                if (fs.existsSync(preferFile)) {
                    return preferFile;
                }
            }
            return false;
        }

        if (subfix === '.' + prefer) {
            // load orgin file if subfix == prefer
            filePath = subPath;
        }
        else {
            var preferFile = getPreferFile();
            if (preferFile) {
                // load prefer file if prefer file is exist
                filePath = preferFile;
            }
            else if (subfix === '.default') {
                // load xxx.default.js only if xxx.js (normalName) is not exist
                var normalName = dirname + p.sep + p.basename(basename, subfix) + ext;
                if (fs.existsSync(normalName)) {
                    filePath = normalName;
                }
                else {
                    // load default file if normal file is not exist
                    filePath = subPath;
                }
            }
            else if (subfix === '') {
                filePath = subPath;
            }
        }
        if (filePath) {
            filePath = p.normalize(filePath);
            if (loaded[filePath]) {
                return;
            }
            // 记录confID与filePath均被处理用于减少查询操作
            loaded[filePath] = true;
            loaded[confID] = true;
            files.push(filePath);
        }
    });
    return files;
};
