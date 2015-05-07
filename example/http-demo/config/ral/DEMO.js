module.exports.DEMO = { // 声明服务名为DEMO
    // 请求协议与数据格式配置
    protocol: 'http', // 使用http协议请求
    pack: 'querystring', // 数据封装为query
    unpack: 'string', // 约定服务端返回string数据
    method: 'GET', // 使用GET请求
    encoding: 'gbk', // 服务器返回utf-8编码
    // 负载均衡与超时重试配置
    balance: 'roundrobin', // 负载均衡策略
    timeout: 5000, // 请求最长超时时间500ms
    retry: 0, // 请求重试次数
    // HTTP协议特有配置
    query: { // 服务的全局query
        st: '3'
    },
    path: '/', // 默认URL路径
    headers: { // 服务的全局headers
        'x-client': 'ral'
    },
    // 后端地址配置
    server: [ // 可以配置多个后端地址
        {
            host: 'wenku.baidu.com',
            port: 80
        }
    ]
};