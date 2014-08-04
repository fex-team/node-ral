/*
 * fis
 * http://fis.baidu.com/
 * 2014/8/4
 */

'use strict';

module.exports.without_pack = {
    'bookServiceBNS' : {
        unpack : 'json',
        encoding : 'GBK',
        balance : 'random',
        protocol : 'http',
        server : [
            //可选的备用服务器信息，启动时如果没能成功获取BNS信息，会使用备用服务器信息，如果没有备用信息则启动失败
            { host : 'st.yd.baidu.com', port : 80, idc : 'st'},
            { host : 'tc.yd.baidu.com', port : 80, idc : 'tc'}
        ]
    }
};

module.exports.without_unpack = {
    'bookServiceBNS' : {
        pack : 'json',
        encoding : 'GBK',
        balance : 'random',
        protocol : 'http',
        server : [
            //可选的备用服务器信息，启动时如果没能成功获取BNS信息，会使用备用服务器信息，如果没有备用信息则启动失败
            { host : 'st.yd.baidu.com', port : 80, idc : 'st'},
            { host : 'tc.yd.baidu.com', port : 80, idc : 'tc'}
        ]
    }
};

module.exports.without_balance = {
    'bookServiceBNS' : {
        unpack : 'json',
        pack : 'json',
        encoding : 'GBK',
        protocol : 'http',
        server : [
            //可选的备用服务器信息，启动时如果没能成功获取BNS信息，会使用备用服务器信息，如果没有备用信息则启动失败
            { host : 'st.yd.baidu.com', port : 80, idc : 'st'},
            { host : 'tc.yd.baidu.com', port : 80, idc : 'tc'}
        ]
    }
};

module.exports.without_protocol = {
    'bookServiceBNS' : {
        unpack : 'json',
        pack : 'json',
        encoding : 'GBK',
        balance : 'random',
        server : [
            //可选的备用服务器信息，启动时如果没能成功获取BNS信息，会使用备用服务器信息，如果没有备用信息则启动失败
            { host : 'st.yd.baidu.com', port : 80, idc : 'st'},
            { host : 'tc.yd.baidu.com', port : 80, idc : 'tc'}
        ]
    }
};

module.exports.with_invalid_encoding = {
    'bookServiceBNS' : {
        unpack : 'json',
        pack : 'json',
        encoding : 'GBK1',
        balance : 'random',
        protocol : 'http',
        server : [
            //可选的备用服务器信息，启动时如果没能成功获取BNS信息，会使用备用服务器信息，如果没有备用信息则启动失败
            { host : 'st.yd.baidu.com', port : 80, idc : 'st'},
            { host : 'tc.yd.baidu.com', port : 80, idc : 'tc'}
        ]
    }
};

module.exports.without_server = {
    'bookServiceBNS' : {
        unpack : 'json',
        pack : 'json',
        encoding : 'GBK',
        balance : 'random',
        protocol : 'http'
    }
};

module.exports.without_server_info = {
    'bookServiceBNS' : {
        unpack : 'json',
        pack : 'json',
        encoding : 'GBK',
        balance : 'random',
        protocol : 'http',
        server : [
        ]
    }
};

module.exports.without_port = {
    'bookServiceBNS' : {
        unpack : 'json',
        pack : 'json',
        encoding : 'GBK',
        balance : 'random',
        protocol : 'http',
        server : [
            { host : '127.0.0.1'}
        ]
    }
};