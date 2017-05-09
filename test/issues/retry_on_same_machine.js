module.exports = {
    'retry_on_same_machine': {
        unpack: 'string',
        pack: 'querystring',
        method: 'GET',
        encoding: 'utf-8',
        balance: 'roundrobin',
        protocol: 'http',
        retry: 1,
        query: 'from=ral',
        server: [{
            host: '127.0.0.1',
            port: 8192
        }, {
            host: '127.0.0.1',
            port: 8193
        }]
    },
}
