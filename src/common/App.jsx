/**
 * Created by hao.cheng on 2017/4/16.
 */
import fetch from 'isomorphic-fetch'
import {hashHistory} from 'react-router';
import {message} from 'antd';
import cookie from 'js-cookie';
import U from '../utils';
let AwesomeBase64 = require('awesome-urlsafe-base64');

let ENV_CONFIG;
if (process.env.API_ENV == 'sandbox' || process.env.API_ENV == 'dev') {
    ENV_CONFIG = require('./env/sandbox').default;
}

if (process.env.API_ENV == 'prod') {
    ENV_CONFIG = require('./env/prod').default;
}

const API_BASE = window.location.protocol + ENV_CONFIG.api;
const URL_H5 = ENV_CONFIG.urlH5;
const urlConsole = ENV_CONFIG.urlConsole;


const go = function (hash, context) {
    hashHistory.push(hash);
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
        domain: ENV_CONFIG.cookieDomain,
        path: '/',
        expires: expiresDate,
    })
};

const getCookie = (k) => cookie.get(k);

const removeCookie = (k) => cookie.remove(k);


const api = (url, params, options) => {
    params = params || {};
    options = options || {};
    if (options.requireSession === undefined) {
        options.requireSession = true;
    }
    if (options.defaultErrorProcess === undefined) {
        options.defaultErrorProcess = true;
    }

    let sessionId = getCookie('x-adm-sess');
    if (U.str.isNotEmpty(sessionId)) {
        params['x-adm-sess'] = sessionId;
    }
    let defaultError = {'code': 0, 'msg': '网络错误'};
    let apiPromise = function (resolve, reject) {
        let rejectWrap = reject;

        if (options.defaultErrorProcess) {
            rejectWrap = function (err) {
                message.error(options.errorMsg ? options.errorMsg : err.msg);
                reject(err);
            };
        }
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

        fetch(API_BASE + url, {
            method: 'POST',
            body: dataStr,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then((response) => {
            if (!options.noParse) {
                return response.json()
            } else {
                return response.text();
            }
        }).then(function (ret) {
            if (options.noParse) {
                resolve(ret);
                return;
            }
            var error = ret.error;
            if (error) {
                if (error.code == 5) {
                    //登录会话过期
                    removeCookie('x-adm-sessid');
                    hashHistory.push('login');
                    return;
                }
                if (error.code == 99) {
                    //登录会话过期
                    message.info('后台维护中,请稍后...');
                    return;
                }
                rejectWrap(error);
                return;
            }

            resolve(ret.result);
        }, function () {
            rejectWrap(defaultError);
        });
    };
    return new Promise(apiPromise);
};

const uuid = function () {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
};

let getShopURL = (id) => {
    return URL_H5 + 'app' + AwesomeBase64.encode(new Buffer(id.toString())) + '?_t=1';
};

let getCouponsUrl = (code) => {
    if (!code)return;
    return urlConsole + '?_t=1' + '#/fillInfo/?faccess=1&coupon=' + code;
};

export default {
    getCouponsUrl,
    getShopURL,
    go,
    api,
    uuid,
    saveCookie,
    getCookie,
    removeCookie,
};


