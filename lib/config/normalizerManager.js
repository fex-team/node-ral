/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/19
 */

'use strict';

var RalModule = require('../ralmodule.js');

function NormalizerManager(){
    this.normalizers = ['default'];
}

NormalizerManager.prototype.setConfigNormalizer = function(normalizers){
    this.normalizers = normalizers;
};

NormalizerManager.prototype.needUpdate = function(config){
    this._travel(config, function(normalizer, config){
        if (normalizer.needUpdate(config)){
            return true;
        }
    });
    return false;
};

NormalizerManager.prototype._travel = function(config, func){
    var me = this;
    this.normalizers.forEach(function(normalizer, index){
        if (typeof normalizer === "string"){
            var instance = RalModule.modules.normalizer[normalizer];
            if (instance){
                me.normalizers[index] = instance;
                normalizer = instance;
            }else{
                throw new Error('invalid normalizer :' + normalizer)
            }
        }
        func(normalizer, config);
    });
};

NormalizerManager.prototype.apply = function(config){
    this._travel(config, function(normalizer, config){
        normalizer.normalizeConfig(config);
    });
};

module.exports = NormalizerManager;