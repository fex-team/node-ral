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

NormalizerManager.prototype.apply = function(config){
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
        normalizer.normalizeConfig(config);
    });
};


module.exports = NormalizerManager;