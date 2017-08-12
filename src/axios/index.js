/**
 * Created by hao.cheng on 2017/4/16.
 */
import axios from 'axios';
import {message} from 'antd';

const ENV = 'sandbox';
const ENV_CONFIG = {
    sandbox: {
        api: '//sandbox-api.wakkaa.com/1/',
        log: true,
    }
};
const API_BASE = window.location.protocol + ENV_CONFIG[ENV].api;
let instance = axios.create({
    baseURL: API_BASE,
    timeout: 1000,
    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
});


// 添加请求拦截器
instance.interceptors.request.use((config) => {
    //判断是否登录

    return config;
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});

// 添加响应拦截器
instance.interceptors.response.use(function (response) {
    // 对响应数据做点什么

    if(response.data)
    return response;
}, function (error) {
    // 对响应错误做点什么
    return Promise.reject(error);
});

export default instance;


