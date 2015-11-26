module.exports = {
    b: {
        unpack: 'json',
        pack: 'json',
        encoding: 'GBK',
        balance: 'random',
        protocol: 'http',
        query: {
            name: 'default'
        },
        server: [{
            host: 'st.yd.baidu.com',
            port: 80,
            idc: 'st'
        }]
    }
};
