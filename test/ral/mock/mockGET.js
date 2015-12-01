/**
 * @file node-ral
 * @author hefangshi@baidu.com
 * http://fis.baidu.com/
 * 2014/8/8
 */

'use strict';

module.exports = {
    GET_QS_SERV: {
        mock: function (options) {
            if (options.query.type === 'error') {
                throw new Error('mock error');
            }
            return {
                query: {
                    from: 'mock'
                },
                port: 8192
            };
        }
    },
    CHANGE_PACK_UNPACK: {
        minRespTime: 500,
        maxRespTime: 1000,
        respTimeMethod: 'random',
        mock: function () {
            return {
                query: {
                    from: 'mock'
                },
                port: 8193
            };
        }
    },
    TEST_QUERY_SERV: {
        mock: {
            query: {
                from: 'mock_plan'
            },
            port: 8194
        }
    },
    POST_QS_SERV: {
        fatalRate: 1,
        mock: {
            query: {
                from: 'mock_fatal'
            },
            port: 8192
        }
    }
};
