/**
 * Created by hao.cheng on 2017/4/16.
 */
import axios from 'axios';
import {hashHistory} from 'react-router';
import {message} from 'antd';
import cookie from 'js-cookie';
import U from '../utils';

let ENV = 'sandbox';
if (process.env.NODE_ENV == 'production') {
    ENV = 'prod';
}

const ENV_CONFIG = {
    prod: {
        api: '//api.wakkaa.com/1/',
        log: false,
        cookieDomain: 'wakkaa.com',
    },
    sandbox: {
        api: '//sandbox-api.wakkaa.com/1/',
        log: false,
        cookieDomain: window.location.hostname,
    }
};

const API_BASE = window.location.protocol + ENV_CONFIG[ENV].api;

const instanceFactory = () => {
    let instance = axios.create({
        baseURL: API_BASE,
        timeout: 1000,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    });

// 添加请求拦截器
    instance.interceptors.request.use((config) => {
        console.log('interceptors request');
        return config;
    }, function (error) {
        // 对请求错误做些什么
        return Promise.reject(error);
    });

// 添加响应拦截器
    instance.interceptors.response.use(function (response) {
        // 对响应数据做点什么
        console.log('interceptors response');
        if (response.data.error) {
            //message.warn(response.data.error.msg);

            return response;
        }
        return response;
    }, error => {
        // 对响应错误做点什么
        if (error.response)
            return Promise.reject(error);
    });

    return instance;
};

const go = function (hash, context) {
    context = context || this;
    context.props.router.push(hash);
};

const saveCookie = (k, v, opt) => {
    let expiresDate = null;
    if (!opt || !opt.expires) {
        expiresDate = new Date();
        expiresDate.setTime(expiresDate.getTime() + 60 * 60 * 1000);
    } else {
        if (opt && typeof opt.expires == "number") {
            expiresDate = new Date().setTime(new Date().getTime() + opt.expires * 3600 * 1000);
        } else {
            expiresDate = new Date(opt.expires)
        }
    }
    cookie.set(k, v, {
        domain: ENV_CONFIG[ENV].cookieDomain,
        path: '/',
        expires: expiresDate,
    })
};

const getCookie = (k) => cookie.get(k);

const removeCookie = (k) => cookie.remove(k);


const api = (url, params, options) => {
    params = params || {};
    let sessionId = getCookie('x-adm-sess');
    if (U.str.isNotEmpty(sessionId)) {
        params['x-adm-sess'] = sessionId;
    }
    let defaultError = {'code': 0, 'msg': '网络错误'};
    let apiPromise = function (resolve, reject) {
        let rejectWrap = reject;
        let dataStr = '';
        for (let key in params) {
            if (dataStr.length > 0) {
                dataStr += '&';
            }
            if (params.hasOwnProperty(key)) {
                let value = params[key];
                if (value === undefined || value === null) {
                    value = '';
                }
                dataStr += (key + '=' + encodeURIComponent(value));
            }
        }
        if (dataStr.length == 0) {
            dataStr = null;
        }

        instanceFactory().post(url, dataStr)
            .then((response) => {
                if (!response) {
                    rejectWrap('服务器 未返回数据,检查是否传参数有误,或者与服务器确认!  :' + response);
                    message.error('噢噢 !-.- 网络错误请重新提交..')
                    return;
                }
                let error = response.data && response.data.error;
                if (error) {
                    if (error.code == 5) {
                        //登录会话过期
                        removeCookie('x-adm-sessid');
                        hashHistory.push('login');
                    }
                    message.error(error.msg);
                    rejectWrap(error);
                    return;
                }
                resolve(response.data.result);
            }, (error) => {
                message.error(error);
                rejectWrap(error);
            })

    };
    return new Promise(apiPromise);
};

const uuid = function () {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
};


export default {
    go,
    api,
    uuid,
    saveCookie,
    getCookie,
    removeCookie,
};


