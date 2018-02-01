node-ral
===========

 [![Build Status][travis-image]][travis-url] [![Coveralls Status][coveralls-image]][coveralls-url] [![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url]


`node-ral` 是一个专为 `Node` 服务端应用打造的一款工业级后端服务管理库，它的特色是统一了各种通信协议、数据格式的请求接口，提供了集中化的服务资源配置管理能力，以及完善的异常处理和日志记录。

目前 `node-ral` 已经在百度公司内外经过长时间的使用验证，为多个基于 `Node` 的产品或框架提供后端服务管理功能，表现非常稳定可靠。

## 兼容性

- [x] node 0.10.x
- [x] node 0.12.x
- [x] node 4.x
- [x] node 5.x
- [x] node 6.x
- [x] node 8.x

> io.js 1.63至1.8.1版本不支持GBK编码

## 快速开始

`node-ral` 为了实现后端服务配置的统一管理，要求后端服务请求的配置与业务实现分离，因此在使用之前必须创建后端服务的配置文件。

我们以 [百度地图WebAPI](http://developer.baidu.com/map/index.php?title=webapi/guide/webservice-placeapi#Place.E5.8C.BA.E5.9F.9F.E6.A3.80.E7.B4.A2POI.E6.9C.8D.E5.8A.A1) 为例做一个简单的DEMO，你也可以直接在[example/baidumap](./example/baidumap)中直接下载。

##### 安装

```bash
npm init
npm i node-ral --save
```

##### 创建配置

```javascript

 // config/ral/API.js 

module.exports.MAPAPI= {           // 声明服务名为MAPAPI
    // 请求协议与数据格式配置
    protocol: 'http',              // 使用http协议请求
    pack: 'querystring',           // 数据封装为query
    unpack: 'json',                // 约定服务端返回JSON数据
    encoding: 'utf-8',             // 服务器返回utf-8编码
    // 负载均衡与超时重试配置
    balance: 'roundrobin',         // 负载均衡策略
    timeout: 500,                  // 请求最长超时时间500ms
    retry: 1,                      // 请求重试次数
    // HTTP协议特有配置
    method: 'GET',                 // 使用GET请求
    query: {                       // 服务的全局query
        ak: '0C62f9f0ee027b6052dfa35b0f38b61a',
        output: 'json',
        page_size: 10,
        page_num: 0,
        scope: 1
    },
    path: '/place/v2/search',      // API路径
    headers: {                     // 服务的全局headers
        'x-client': 'ral'
    },
    // 后端地址配置
    server: [                      // 可以配置多个后端地址
        {
            host: 'api.map.baidu.com',
            port: 80
        }
    ]
}
```

##### 初始化

```javascript
// ral.js

var RAL = require('node-ral').RAL;
var ralP = require('node-ral').RALPromise; // 使用Ral的Promise版接口
var path = require('path');

// 初始化RAL，只需在程序入口运行一次
RAL.init({
    // 指定RAL配置目录
    confDir: path.join(__dirname, 'config/ral')
});

module.exports = ralP;
``` 

##### 调用服务

```javascript
// index.js

var ralP = require('./ral.js');
var assert = require('assert');

ralP('MAPAPI', {
    data: {
        region: '北京',
        query: '奥林匹克森林公园'
    }
}).then(function (data) {
    assert.equal(data.status, 0);
    console.dir(data.results[0]);
}).catch(function (err) {
    console.error(err);
});
```

##### 执行结果

执行一下 `node index.js` 我们就可以看到奥林匹克森林公园的搜索结果了

```
 {
     name: '奥林匹克森林公园',
     location: { lat: 40.025255, lng: 116.396803 },
     address: '北京市朝阳区安立路',
     street_id: '03d7e5971f3675483c9a5e9e',
     telephone: '010-64529060',
     uid: '03d7e5971f3675483c9a5e9e'
 } 
```

同时我们可以在 `logs` 目录查看请求的具体日志

比如 `HTTP` 协议请求日志，在这里我们可以看到由协议提供的一些日志信息

```
TRACE: 15-04-28 17:07:45 [-:-] errno[-] logId[-] uri[-] user[-] refer[-] cookie[-]  [yog-ral] [cluster main][HttpProtocol] request start {"host":"api.map.baidu.com","port":80,"path":"/place/v2/search?ak=0C62f9f0ee027b6052dfa35b0f38b61a&output=json&page_size=10&page_num=0&scope=1&region=%E5%8C%97%E4%BA%AC&query=%E5%A5%A5%E6%9E%97%E5%8C%B9%E5%85%8B%E6%A3%AE%E6%9E%97%E5%85%AC%E5%9B%AD","method":"GET","headers":{"x-client":"ral"},"agent":false} 
```

以及 `node-ral` 通用的日志信息，其中会包括服务的基本信息以及各个阶段的处理时间

```
NOTICE: 15-04-28 17:07:45 [-:-] errno[-] logId[-] uri[-] user[-] refer[-] cookie[-]  [yog-ral] [cluster main][RAL] request end service=MAPAPI requestID=22268922 conv=querystring/json prot=http method=GET path=/place/v2/search remote=api.map.baidu.com:80 cost=116.579 talk=115.316 write=108.190 read=3.633 pack=0.744 unpack=1.056 retry=0/1 
```

## 文档

请查阅文档[WIKI](https://github.com/fex-team/node-ral/wiki)

[downloads-image]: http://img.shields.io/npm/dm/node-ral.svg
[npm-url]: https://npmjs.org/package/node-ral
[npm-image]: http://img.shields.io/npm/v/node-ral.svg

[travis-url]: https://travis-ci.org/fex-team/node-ral
[travis-image]: http://img.shields.io/travis/fex-team/node-ral.svg

[coveralls-url]: https://coveralls.io/r/fex-team/node-ral
[coveralls-image]: http://img.shields.io/coveralls/fex-team/node-ral/master.svg
