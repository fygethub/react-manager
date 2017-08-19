/**
 * 接口地址配置文件
 */

let ENV = 'sandbox';
if (process.env.NODE_ENV == 'production') {
    ENV = 'prod';
}
console.log(process.env.NODE_ENV);

export  default ENV;
