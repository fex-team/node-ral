'use strict';

module.exports.PIC_UPLOAD = {
    https: false,
    path: '/upload.php',
    protocol: 'http',
    method: 'POST',
    pack: 'formdata',
    unpack: 'string',
    balance: 'random',
    timeout: 100000,
    server: [
        {
            host: 'www.chuantu.biz',
            port: 80
        }
    ]
};