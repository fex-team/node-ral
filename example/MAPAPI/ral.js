var RAL = require('node-ral').RAL;
var path = require('path');

// 初始化RAL，只需在程序入口运行一次
RAL.init({
    // 指定RAL配置目录
    confDir: path.join(__dirname, 'config/ral')
});

module.exports = RAL;