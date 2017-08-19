/**
 * 接口地址配置文件
 */

let ENV = 'sandbox';
if (process.env.NODE_ENV == 'production') {
    ENV = 'prod';
}
export  default ENV;
