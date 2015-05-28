/**
 * @file config normalizer manager
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/19
 */

'use strict';

var RalModule = require('../ralmodule.js');

function NormalizerManager() {
    this.normalizers = ['default'];
}

NormalizerManager.prototype.setConfigNormalizer = function (normalizers) {
    this.normalizers = normalizers;
};

NormalizerManager.prototype.needUpdate = function (config) {
    var need = false;
    this._travel(config, function (normalizer) {
        if (normalizer.needUpdate(config)) {
            need = true;
        }
    });
    return need;
};

NormalizerManager.prototype._travel = function (config, func) {
    var me = this;
    this.normalizers.forEach(function (normalizer, index) {
        if (typeof normalizer === 'string') {
            var instance = RalModule.modules.normalizer[normalizer];
            if (instance) {
                me.normalizers[index] = instance;
                normalizer = instance;
            }
            else {
                throw new Error('invalid normalizer :' + normalizer);
            }
        }
        func(normalizer);
    });
};

NormalizerManager.prototype.apply = function (config) {
    this._travel(config, function (normalizer) {
        var serviceID = config.serviceID;
        config = normalizer.normalizeConfig(config);
        config.serviceID = serviceID;
    });
    return config;
};

module.exports = NormalizerManager;
