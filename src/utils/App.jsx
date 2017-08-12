import fetch from 'isomorphic-fetch'
import {hashHistory} from 'react-router';
import cookie from 'react-cookie';
import React from 'react'
<<<<<<< Updated upstream
import ReactDOM from 'react-dom';
import Toast from 'antd-mobile/lib/toast'
import U from './U.jsx';
import CommonUtils from './CommonUtils.jsx';
import ENV from './ENV.jsx';
import WechatTools from './WechatTools.jsx';
import {
    BindMobileNotification
} from './CommonComponent.jsx'
=======
import U from './U.jsx';
import ENV from './ENV.jsx';

>>>>>>> Stashed changes

const ENV_CONFIG = {
    prod: {
        api: '//api.wakkaa.com/1/',
        appId: 'wxa18a39c514d6ca4b',
        log: false,
        ws: ['wss://im.wakkaa.com/', 'ws://im.wakkaa.com/'],
        ws_liveim: ['wss://liveim.wakkaa.com/', 'ws://liveim.wakkaa.com/'],
        cookieDomain: 'wakkaa.com',
        authDomain: 'https://wx.wakkaa.com/'
    },
    sandbox: {
        api: '//sandbox-api.wakkaa.com/1/',
        appId: 'wx8067146f8cb85d1a',
        log: true,
        ws: ['wss://sandbox-im.wakkaa.com:19011', 'ws://sandbox-im.wakkaa.com:19010/'],
        ws_liveim: ['wss://sandbox-liveim.wakkaa.com:8001/', 'ws://sandbox-liveim.wakkaa.com:8000/'],
        cookieDomain: 'wakkaa.com',
        authDomain: 'https://weixin.cyjx.com/'
    },
    dev: {
        api: '//sandbox-api.wakkaa.com/1/',
        appId: 'wx8067146f8cb85d1a',
        log: true,
        ws: ['wss://sandbox-im.wakkaa.com:19011', 'ws://sandbox-im.wakkaa.com:19010/'],
        ws_liveim: ['wss://sandbox-liveim.wakkaa.com:8001/', 'ws://sandbox-liveim.wakkaa.com:8000/'],
        cookieDomain: window.location.hostname,
        authDomain: 'https://weixin.cyjx.com/'
    }
};

const API_BASE = window.location.protocol + ENV_CONFIG[ENV].api;
const APP_ID = ENV_CONFIG[ENV].appId;
const SPONSOR_ID = U.getHashParameter('sponsorId');
const AGENT_ID = U.getHashParameter('agentId');

const WECHAT_WATCH_URL = 'https://mp.weixin.qq.com/s/F-md9u8xtN3oLsBs6lO8Zg';
const WS_URL = ENV_CONFIG[ENV].ws;
const WS = U.isIOS() ? WS_URL[0] : WS_URL[1];

const WS_LIVEIM_URL = ENV_CONFIG[ENV].ws_liveim;
const WS_LIVEIM = U.isIOS() ? WS_LIVEIM_URL[0] : WS_LIVEIM_URL[1];

var SHARE_AGENT_ID = AGENT_ID;
U.enableLog(ENV_CONFIG[ENV].log);

const AUTH_DOMAIN = ENV_CONFIG[ENV].authDomain;
const REGION_PATH = window.location.protocol + '//f3.cyjx.com/assets/region_CN_antd-mobile.json';

<<<<<<< Updated upstream
var AwesomeBase64 = require('awesome-urlsafe-base64');

=======
>>>>>>> Stashed changes
function getMediaId() {
    return getCookie('mdi-id');
}

// function getCookiePath() {
//     var path = window.location.pathname;
//     var offset = path.indexOf('/', -1);
//     if (offset < 0) {
//         return path;
//     }
//     return path.substring(0, offset);
// }

const COOKIE_PATH = '/';

var saveCookie = function (k, v, opt) {

    var expiresDate = null;
    if (opt && opt.expirehours) {
        expiresDate = new Date();
        expiresDate.setTime(expiresDate.getTime() + (opt.expirehours * 60 * 60 * 1000));
    }

    cookie.save(k, v, {
        domain: ENV_CONFIG[ENV].cookieDomain,
        path: COOKIE_PATH,
        expires: expiresDate
    });
};
var getCookie = function (k) {
    return cookie.load(k);
};
var removeCookie = function (k) {
    return cookie.remove(k);
};

var sessionAuthorized = -1;

var authSessionPromise = function (resolve, reject) {
    var checkSessionAuthorized = function () {
        if (sessionAuthorized === 1) {
            if (resolve) {
                resolve();
            }
            return;
        } else if (sessionAuthorized === 0) {
            if (reject) {
                reject();
            }
            return;
        } else {
            setTimeout(checkSessionAuthorized, 20);
        }
    };
    checkSessionAuthorized();
};


var getRequestUrl = function (href) {
    var index = href.indexOf('#');
    var hash = '';
    if (index > 0) {
        hash = href.substr(index);
        href = href.substring(0, index);
    }
    index = href.indexOf('?');
    if (index > 0) {
        href = href.substring(0, index);
    }
    return href + hash;
};
var api = function (path, params, options) {
<<<<<<< Updated upstream
    params = params || {};
    if (SPONSOR_ID) {
        params.sponsorId = SPONSOR_ID;
    }
    if (AGENT_ID) {
        params.agentId = AGENT_ID;
    }
=======

>>>>>>> Stashed changes
    options = options || {};
    if (options.requireSession === undefined) {
        options.requireSession = true;
    }
    if (options.defaultErrorProcess === undefined) {
        options.defaultErrorProcess = true;
    }
    var defaultError = {'code': 0, 'msg': '网络错误'};
    var apiPromise = function (resolve, reject) {
        var rejectWrap = reject;
        if (options.defaultErrorProcess) {
            rejectWrap = function (err) {
<<<<<<< Updated upstream
                Toast.fail(err.msg);
=======
>>>>>>> Stashed changes
                reject(err);
            };
        }
        var apiUrl = API_BASE + path;
<<<<<<< Updated upstream
        var sessionId = getCookie('user-sessid');
        if (U.str.isNotEmpty(sessionId)) {
            params['x-usr-sess'] = sessionId;
        }
        var msessionId = getCookie('mdi-sessid');
        if (U.str.isNotEmpty(msessionId)) {
            params['x-mdi-sess'] = msessionId;
        }
        params['x-mdi-id'] = getMediaId();
        params['x-client'] = 'web';
        params['x-api-version'] = '1.5';
=======
>>>>>>> Stashed changes
        var dataStr = '';
        for (var key in params) {
            if (dataStr.length > 0) {
                dataStr += '&';
            }
            var value = params[key];
            if (value === undefined || value === null) {
                value = '';
            }
            dataStr += (key + '=' + encodeURIComponent(value));
        }
        if (dataStr.length == 0) {
            dataStr = null;
        }
        fetch(apiUrl, {
            method: 'POST',
            body: dataStr,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function (response) {
            response.json().then(function (ret) {
                var error = ret.error;
<<<<<<< Updated upstream
                if (error) {
                    if (error.code == 5) {
                        //登录会话过期
                        removeCookie('user-sessid');
                        removeCookie('user-code');
                        removeCookie('user-id');
                        removeCookie('openid');
                        removeCookie('mobile-bind');
                        var requestUrl = getRequestUrl(window.location.href);
                        window.location.href = getWeixinAuthorizeUrl(requestUrl);
                        return;
                    }
                    rejectWrap(error);
                    return;
                }

=======
>>>>>>> Stashed changes
                resolve(ret.result);
            }, function () {
                rejectWrap(defaultError);
            });
        }, function () {
            rejectWrap(defaultError);
        }).catch(() => {
<<<<<<< Updated upstream
            CommonUtils.closePreloader();
        })
    };
    if (options.requireSession) {
        return new Promise(authSessionPromise).then(function () {
            return new Promise(apiPromise);
        }, function () {
            // Toast.fail('登录失败，请在微信中打开本页面');
            return new Promise(apiPromise);
        });
    } else {
        return new Promise(apiPromise);
    }
};

var authSession = function () {

    var _mediaId = U.getShopIdFromUrl();
    let mediaId = AwesomeBase64.decode(_mediaId).toString();

    if (!mediaId) {
        Toast.fail('访问错误');
    }
    saveCookie('mdi-id', mediaId);

    var reqSessId = U.getParameter('x-user-sess') || U.getParameter('sessid');
    if (U.str.isNotEmpty(reqSessId)) {
        saveCookie('user-sessid', reqSessId);
    }
    var code = U.getParameter('code');
    var sesscode = getCookie('user-code');
    var sessid = getCookie('user-sessid');
    if (U.str.isEmpty(sessid) || (U.str.isNotEmpty(code) && sesscode != code)) {
        saveCookie('user-code', code);
        var wx = {
            'appId': APP_ID,
            'code': code
        };
        api('usr/user/signin', {
            'wx': JSON.stringify(wx),
            mediaId: mediaId
        }, {requireSession: false, defaultErrorProcess: false}).then(function (result) {
            if (result.agentId) {
                SHARE_AGENT_ID = result.agentId;
            }
            saveCookie('user-sessid', result.session.id);
            saveCookie('user-id', result.user.id);
            saveCookie('user-nick', result.user.nick);
            if (result.weixin) {
                saveCookie('openid', result.weixin.openid);
            }
            sessionAuthorized = 1;

            let mdiVisit = getCookie('mdi-visit-' + mediaId);
            if (U.str.isEmpty(mdiVisit)) {
                api('usr/media/visit').then(() => {
                    saveCookie('mdi-visit-' + mediaId, '1', {expirehours: 24});
                });
            }

        }, function () {
            sessionAuthorized = 0;
        });
    } else {
        sessionAuthorized = 1;
    }
};

var openBindMobile = function () {
    let bindNotification = document.createElement('div');
    bindNotification.setAttribute('id', 'bindNotification');
    document.body.appendChild(bindNotification);
    ReactDOM.render(
        <BindMobileNotification/>,
        document.getElementById('bindNotification')
    )
}
var checkMobileBind = function (user) {
    if (U.str.isEmpty(user.mobile)) {
        openBindMobile();
    } else {
        saveCookie('mobile-bind', 1);
    }
}

=======

        })
    };
    return new Promise(apiPromise);
};

>>>>>>> Stashed changes
var ready = function (callback, error) {
    return new Promise(authSessionPromise).then(callback, error);
};
var getOpenId = function () {
    return getCookie('openid');
};

var getUserId = function () {
    return getCookie('user-id');
};

var getUserNick = function () {
    return getCookie('user-nick');
};

var getSessionId = function () {
    return getCookie('user-sessid');
};
var getUserSession = function () {
    return getCookie('user-session');
};
var makeWeixinRedirectUrl = function (redirectUrl) {
    var url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + APP_ID + '&redirect_uri='
        + encodeURIComponent(redirectUrl) + '&response_type=code&scope=snsapi_userinfo&state=#wechat_redirect';
    return url;
};
var getWeixinAuthorizeUrl = function (redirectUrl) {
    if (U.getDomainFromUrl(redirectUrl) == 'wx.wakkaa.com') {
        return makeWeixinRedirectUrl(redirectUrl);
    }
    var hashOffset = redirectUrl.indexOf('#');
    if (hashOffset > 0) {
        var hash = redirectUrl.substring(hashOffset + 1);
        var requestUri = redirectUrl.substring(0, hashOffset);
        redirectUrl = AUTH_DOMAIN + 'rh/' + encodeURIComponent(hash) + '/' + encodeURIComponent(requestUri);
    } else {
        var len = redirectUrl.length;
        var protocolEndIndex = redirectUrl.indexOf(':');
        var protocol = redirectUrl.substring(0, protocolEndIndex);
        var domainEndIndex = redirectUrl.indexOf('/', protocolEndIndex + 3);
        if (domainEndIndex < 0) {
            domainEndIndex = len;
        }
        var domain = redirectUrl.substring(protocolEndIndex + 3, domainEndIndex);
        var path = domainEndIndex >= len ? '/' : redirectUrl.substring(domainEndIndex);
        var buf = AUTH_DOMAIN;
        buf += (protocol == 'https' ? 'rs/' : 'r/');
        buf += domain;
        if (U.isNotNull(path)) {
            buf += path;
        }
        redirectUrl = buf;
    }
    return makeWeixinRedirectUrl(redirectUrl);

};

var go = function (path) {
    hashHistory.push(path);
};

var enableShare = function (options) {
    options.debug = (ENV == 'dev' || ENV == 'sandbox');
    options.desc = options.desc || '来自哇咖咖';
    options.imgUrl = options.imgUrl || 'http://c1.wakkaa.com/assets/wkk_logo.png';
    var hash = window.location.hash.substr(1);
    var hashEndIndex = hash.indexOf('?');
    if (hashEndIndex > 0) {
        hash = hash.substring(0, hashEndIndex);
    }
    var sharePath = options.link || hash;
    ready().then(function () {

        var shareLink;
        if (options.shareLink) {
            shareLink = options.shareLink;
        } else {
            var userId = getUserId();
            shareLink = window.location.protocol + '//' + window.location.host + window.location.pathname + '?_ts=1' + '#' + sharePath;
            shareLink += '?sponsorId=' + (userId ? userId : '') + '&agentId=' + (SHARE_AGENT_ID ? SHARE_AGENT_ID : '');
        }
        options.link = shareLink; //getWeixinAuthorizeUrl(shareLink);
<<<<<<< Updated upstream
        WechatTools.enableShare(options);
=======
>>>>>>> Stashed changes
    });
};

var App = {
    api: api,
    ready: ready,
    getUserId: getUserId,
    getUserNick,
    getSessionId: getSessionId,
    getOpenId: getOpenId,
    getMediaId: getMediaId,
    getWeixinAuthorizeUrl: getWeixinAuthorizeUrl,
    go: go,
    getUserSession: getUserSession,
<<<<<<< Updated upstream
    initWeixinTicket: WechatTools.ready,
=======
>>>>>>> Stashed changes
    enableShare: enableShare,
    appId: APP_ID,
    API_BASE: API_BASE,
    saveCookie: saveCookie,
    getCookie: getCookie,
<<<<<<< Updated upstream
    checkMobileBind: checkMobileBind,
    openBindMobile: openBindMobile,
=======
>>>>>>> Stashed changes
    SPONSOR_ID: SPONSOR_ID,
    WS: WS,
    WS_LIVEIM,
    REGION_PATH
};

// init
<<<<<<< Updated upstream
authSession();
WechatTools.init({
    ticketUrl: API_BASE + 'usr/user/wx_jsticket',
    appId: APP_ID,
});
=======
//authSession();
/*
 WechatTools.init({
 ticketUrl: API_BASE + 'usr/user/wx_jsticket',
 appId: APP_ID,
 });
 */
>>>>>>> Stashed changes

export default App;

