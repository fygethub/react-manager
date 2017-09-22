let U = (function () {
    let _logEnabled = false;
    let log = function () {
        if (!_logEnabled || !console || !console.log) {
            return;
        }
        console.log.apply(console, arguments);
    };
    let isLogEnabled = function () {
        return _logEnabled;
    };
    let enableLog = function (enabled) {
        _logEnabled = enabled;
    };

    let str = (function () {
        let isEmpty = function (s) {
            if (isNull(s)) {
                return true;
            }
            if (typeof s !== 'string') {
                return false;
            }
            return s.length === 0;
        };
        let isNotEmpty = function (s) {
            return !isEmpty(s);
        };
        let startsWith = function (s, prefix) {
            return s.indexOf(prefix) === 0;
        };

        let isNull = function (s) {
            return (typeof s === 'undefined' || s === null);
        };
        let isNotNull = function (s) {
            return !isNull(s);
        };

        let endsWith = function (str, suffix) {
            return str.indexOf(suffix, str.length - suffix.length) !== -1;
        };

        let replaceAll = function (s, s1, s2) {
            return s.replace(new RegExp(s1, "gm"), s2);
        };

        let num2str = function (num) {

            if (isNull(num))
                return 0;

            let val = parseInt(num);
            if (val < 1000) {
                return val;
            }
            if (val > 1000 && val < 10000) {
                return (val / 1000).toFixed(1) + 'K';
            }
            if (val > 10000) {
                return (val / 10000).toFixed(1) + '万';
            }
        };

        let formatCurrency = function (num) {
            if (num) {
                //将num中的$,去掉，将num变成一个纯粹的数据格式字符串
                num = num.toString().replace(/\$|\,/g, '');
                //如果num不是数字，则将num置0，并返回
                if ('' === num || isNaN(num)) {
                    return 'Not a Number ! ';
                }
                //如果num是负数，则获取她的符号
                let sign = num.indexOf("-") > 0 ? '-' : '';
                //如果存在小数点，则获取数字的小数部分
                let cents = num.indexOf(".") > 0 ? num.substr(num.indexOf(".")) : '';
                cents = cents.length > 1 ? cents : '';//注意：这里如果是使用change方法不断的调用，小数是输入不了的
                //获取数字的整数数部分
                num = num.indexOf(".") > 0 ? num.substring(0, (num.indexOf("."))) : num;
                //如果没有小数点，整数部分不能以0开头
                if ('' == cents) {
                    if (num.length > 1 && '0' == num.substr(0, 1)) {
                        return 'Not a Number ! ';
                    }
                }
                //如果有小数点，且整数的部分的长度大于1，则整数部分不能以0开头
                else {
                    if (num.length > 1 && '0' == num.substr(0, 1)) {
                        return 'Not a Number ! ';
                    }
                }
                //针对整数部分进行格式化处理，这是此方法的核心，也是稍难理解的一个地方，逆向的来思考或者采用简单的事例来实现就容易多了
                /*
                 也可以这样想象，现在有一串数字字符串在你面前，如果让你给他家千分位的逗号的话，你是怎么来思考和操作的?
                 字符串长度为0/1/2/3时都不用添加
                 字符串长度大于3的时候，从右往左数，有三位字符就加一个逗号，然后继续往前数，直到不到往前数少于三位字符为止
                 */
                for (let i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++) {
                    num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3));
                }
                //将数据（符号、整数部分、小数部分）整体组合返回
                return (sign + num + cents);
            } else {
                return 0;
            }
        };

        return {
            isEmpty,
            isNotEmpty,
            startsWith,
            endsWith,
            replaceAll,
            isNotNull,
            isNull,
            num2str, formatCurrency
        };
    })();

    let date = (function () {
        let pad = function (n) {
            return n < 10 ? '0' + n : n;
        };

        let inAnHour = function (date) {
            let mins = parseInt((Math.floor(new Date()) - Math.floor(new Date(date)) ) / (1000 * 60));
            return mins > -60;
        };

        let in24Hour = function (date) {
            let mins = parseInt((Math.floor(new Date()) - Math.floor(new Date(date)) ) / (1000 * 60));
            return mins > -1440;
        };

        let countdownDays = (date) => {
            return parseInt(Math.floor(new Date(date) - Math.floor(new Date())) / 1000 / 60 / 60 / 24);
        };

        let getCountDownStr = (time) => {
            let timeStr = '',
                days = Math.floor(time / (24 * 3600)),
                hour = parseInt(time / 3600),
                minute = parseInt(time / 60 % 60),
                second = parseInt(time % 60);
            if (days > 0) {
                return days + "天";
            }
            if (hour) {
                timeStr += hour + '小时'
            } else {
                if (minute) {
                    timeStr += minute + '分钟'
                } else {
                    timeStr += second + '秒'
                }
            }
            return timeStr;
        };

        let countdownTimers = function (date) {
            let timers = [0, 0, 0, 0];
            let time = parseInt(Math.floor(new Date(date) - Math.floor(new Date())) / 1000);

            let hours = parseInt(time / 3600);
            if (hours < 10) {
                timers[0] = 0;
                timers[1] = hours;
            } else {
                timers[0] = parseInt(hours / 10);
                timers[1] = parseInt(hours % 10);
            }

            let mins = parseInt((time % 3600) / 60);
            if (mins < 10) {
                timers[2] = 0;
                timers[3] = mins;
            } else {
                timers[2] = parseInt(mins / 10);
                timers[3] = parseInt(mins % 10);
            }

            let seconds = time % 60;
            if (seconds < 10) {
                timers[4] = 0;
                timers[5] = seconds;
            } else {
                timers[4] = parseInt(seconds / 10);
                timers[5] = parseInt(seconds % 10);
            }

            return timers;
        };

        let foreshowTimeout = function (timers) {
            return timers[0] === 0 && timers[1] === 0 && timers[2] === 0 && timers[3] === 0 && timers[4] === 0 && timers[5] === 0;
        };

        let foreshowTimeouted = function (timers) {
            return timers[0] <= 0 && timers[1] <= 0 && timers[2] <= 0 && timers[3] <= 0 && timers[4] <= 0 && timers[5] <= 0;
        };

        let seconds2MS = function (time) {
            let m = 0, s = 0, ret = '';

            time = Math.floor(time % 3600);
            m = Math.floor(time / 60);
            s = Math.floor(time % 60);
            if (m > 0)
                ret = m + '′';
            if (s > 0)
                ret += s + '″';

            return ret;
        };

        let seconds2HMS = function (time) {
            let h = 0,
                m = 0,
                s = 0,
                _h,
                _m,
                _s, ret = '';

            h = Math.floor(time / 3600);
            time = Math.floor(time % 3600);
            m = Math.floor(time / 60);
            s = Math.floor(time % 60);
            if (h > 0) {
                _h = h < 10 ? '0' + h : h;
                ret += _h + ':';
            }
            _s = s < 10 ? '0' + s : s;
            _m = m < 10 ? '0' + m : m;

            ret += _m + ':' + _s;

            return ret;
        };

        let format = function (date, fmt) {
            if (!date || !fmt) {
                return null;
            }
            if (typeof date == 'string') {
                date = parse(date);
            }
            let o = {
                "M+": date.getMonth() + 1, // 月份
                "d+": date.getDate(), // 日
                "h+": date.getHours() % 12 === 0 ? 12 : date.getHours() % 12, // 小时
                "H+": date.getHours(), // 小时
                "m+": date.getMinutes(), // 分
                "s+": date.getSeconds(), // 秒
                "q+": Math.floor((date.getMonth() + 3) / 3), // 季度
                "S": date.getMilliseconds()
            };
            let week = {
                "0": "\u65e5",
                "1": "\u4e00",
                "2": "\u4e8c",
                "3": "\u4e09",
                "4": "\u56db",
                "5": "\u4e94",
                "6": "\u516d"
            };
            if (/(y+)/.test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "")
                    .substr(4 - RegExp.$1.length));
            }
            if (/(E+)/.test(fmt)) {
                fmt = fmt
                    .replace(
                        RegExp.$1,
                        ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "\u661f\u671f"
                                : "\u5468")
                            : "")
                        + week[date.getDay() + ""]);
            }
            for (let k in o) {
                if (new RegExp("(" + k + ")").test(fmt)) {
                    fmt = fmt.replace(RegExp.$1,
                        (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k])
                                .substr(("" + o[k]).length)));
                }
            }
            return fmt;
        };

        let formatISO8601 = function (d) {
            if (!d) {
                return null;
            }
            return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-'
                + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + ':'
                + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds())
                + 'Z';
        };
        let getInt = function (s) {
            let offset = 0;
            for (let i = 0; i < s.length; i++) {
                if (s.charAt(i) === '0') {
                    continue;
                }
                offset = i;
                break;
            }
            if (offset === 0) {
                return parseInt(s);
            }
            return parseInt(s.substr(offset));
        };
        let parse = function (v, timezoneOffset) {
            if (!v) {
                return null;
            }
            // yyyy-MM-ddTHH:mm:ssZ
            // yyyy-MM-ddTHH:mm:ss.SSSZ
            // yyyy-MM-dd HH:mm:ss.SSS
            let index = 0;
            let year = getInt(v.substr(index, 4));
            index += 5;
            let month = getInt(v.substr(index, 2)) - 1;
            index += 3;
            let day = getInt(v.substr(index, 2));
            index += 3;
            let hour = index >= v.length ? 0 : getInt(v.substr(index, 2));
            index += 3;
            let minute = index >= v.length ? 0 : getInt(v.substr(index, 2));
            index += 3;
            let second = index >= v.length ? 0 : getInt(v.substr(index, 2));
            // TODO more format
            if (v.charAt(v.length - 1) === 'Z') {
                let millSecond = v.indexOf('.') > 0 ? getInt(v.substring(v.indexOf('.') + 1, v.length - 1)) : 0;
                let d = new Date();
                d.setUTCFullYear(year);
                d.setUTCMonth(month);
                d.setUTCDate(day);
                d.setUTCHours(hour);
                d.setUTCMinutes(minute);
                d.setUTCSeconds(second);
                d.setUTCMilliseconds(millSecond);
                return d;
            } else {
                let millSecond = v.indexOf('.') > 0 ? getInt(v.substring(v.indexOf('.') + 1)) : 0;
                let date = new Date(year, month, day, hour, minute, second,
                    millSecond);
                if (!str.isNull(timezoneOffset)) {
                    let diff = timezoneOffset - date.getTimezoneOffset();
                    date.setTime(date.getTime() - diff * 60 * 1000);
                }
                return date;
            }
        };

        let splashTime = function (date) {
            if (typeof date == 'string') {
                date = parse(date);
            }

            let date3 = (Math.floor(new Date()) - Math.floor(new Date(date)) ) / 1000;

            let months = Math.floor(date3 / (30 * 24 * 3600));
            if (months > 0)
                return months + " 月前";

            let days = Math.floor(date3 / (24 * 3600));
            if (days > 0)
                return days + " 天前";


            let hours = Math.floor(date3 / 3600);
            if (hours > 0)
                return hours + " 小时前";

            let minutes = Math.floor(date3 / 60);

            if (minutes > 0)
                return minutes + " 分钟前";
            return Math.floor(date3 / 60) > 0 ? Math.floor(date3 / 60) : '刚刚';

        };

        let isToday = function (date) {
            let d = U.date.format(U.date.parse(date), 'yyyy-MM-dd');
            let today = U.date.format(new Date(), 'yyyy-MM-dd');
            return d === today;
        };

        let countDownStr = function (t, append, before = false) {
            let h = 0;
            if (!before) {
                h = parseInt(Math.floor(new Date(t) - Math.floor(new Date())) / 1000 / 3600);
            } else {
                h = (new Date().getTime() - new Date(t).getTime()) / 1000 / 3600;
            }

            let timeStr = '',
                days = Math.floor(h / 24),
                hour = parseInt(h % 24);
            if (days > 0) {
                timeStr = days + "天";
            }
            if (hour > 0 && append) {
                timeStr += hour + '小时'
            }
            return !before ? timeStr : timeStr + '前';
        };

        let getCurrentMonth = function (month) {
            switch (month) {
                case 0:
                    return "一月";
                case 1:
                    return "二月";
                case 2:
                    return "三月";
                case 3:
                    return "四月";
                case 4:
                    return "五月";
                case 5:
                    return "六月";
                case 6:
                    return "七月";
                case 7:
                    return "八月";
                case 8:
                    return "九月";
                case 9:
                    return "十月";
                case 10:
                    return "十一月";
                case 11:
                    return "十二月";
                default:
                    return "本月"
            }
        };

        let getWeekDay = function (num) {
            switch (num) {
                case 0:
                    return "周日";
                case 1:
                    return "周一";
                case 2:
                    return "周二";
                case 3:
                    return "周三";
                case 4:
                    return "周四";
                case 5:
                    return "周五";
                case 6:
                    return "周六";
                default:
                    return "今天"
            }
        };

        return {
            parse,
            inAnHour,
            in24Hour,
            seconds2MS,
            seconds2HMS,
            getCountDownStr,
            isToday,
            countDownStr,
            countdownDays,
            countdownTimers,
            foreshowTimeout,
            foreshowTimeouted,
            format,
            formatISO8601,
            getDayOfYear: function (date) {
                let start = new Date(date.getFullYear(), 0, 0);
                let diff = date.getTime() - start.getTime();
                let oneDay = 1000 * 60 * 60 * 24;
                return Math.floor(diff / oneDay);
            },
            splashTime,
            getCurrentMonth,
            getWeekDay
        };
    })();

    let array = (function () {
        let swap = function (arr, index1, index2) {
            arr[index1] = arr.splice(index2, 1, arr[index1])[0];
            return arr;
        };

        let remove = function (arr, index) {
            if (isNaN(index) || index > arr.length) {
                return false;
            }
            arr.splice(index, 1);
            return arr;
        };

        let insert = function (arr, index, item) {
            arr.splice(index, 0, item);
            return arr;
        };

        let insertLast = function (arr, item) {
            arr.splice(arr.length, 0, item);
            return arr;
        };

        let msgRemoveDup = function (arr, sort) {

            let result = [];
            let tmp = {};
            for (let i = 0; i < arr.length; i++) {
                if (!(tmp[arr[i].p.id])) {
                    if (arr[i].p.id) {
                        result.push(arr[i]);
                        tmp[arr[i].p.id] = 1;
                    }
                }
            }

            if (sort) {
                result = msgQuickSort(result);
            }

            return result;
        };

        let msgQuickSort = function (arr) {
            if (arr.length <= 1) {
                return arr;
            }
            let pivotIndex = Math.floor(arr.length / 2);
            let pivot = arr.splice(pivotIndex, 1)[0];
            let left = [];
            let right = [];
            for (let i = 0; i < arr.length; i++) {
                if (parseInt(arr[i].p.id) < parseInt(pivot.p.id)) {
                    left.push(arr[i]);
                } else {
                    right.push(arr[i]);
                }
            }
            return msgQuickSort(left).concat([pivot], msgQuickSort(right));
        };

        let contains = (arr, obj) => {
            let i = arr.length;
            while (i--) {
                if (arr[i] === obj) {
                    return true;
                }
            }
            return false;
        };

        return {
            swap, remove, insert, insertLast, msgRemoveDup, contains
        }
    })();

    let url = (() => {

        let getHashParameter = function (name) {
            let hash = window.location.hash;
            if (!hash) {
                return null;
            }
            let offset = hash.indexOf('?');
            if (offset < 0) {
                return null;
            }
            hash = hash.substr(offset + 1);
            let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            let r = hash.match(reg);
            if (r === null) {
                return null;
            }
            return unescape(r[2]);
        };
        let getParameter = function (name) {
            let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            let r = window.location.search.substr(1).match(reg);
            if (r !== null) {
                return unescape(r[2]);
            }
            return null;
        };

        let getDomainFromUrl = function (url) {
            let offset = url.indexOf("//");
            let offset2 = url.indexOf("/", offset + 2);
            if (offset2 === -1) {
                return url.substring(offset + 2);
            }
            return url.substring(offset + 2, offset2);
        };

        return {getHashParameter, getParameter, getDomainFromUrl}


    })();

    let isIOS = function () {
        return /(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent);
    };

    let setWXTitle = (t) => {
        let i = document.createElement('iframe');
        i.style.display = 'none';
        i.onload = () => {
            setTimeout(() => {
                i.remove();
            }, 9);
        };
        document.body.appendChild(i);
        document.title = t;
    };

    const orderBy = (collection, key, orders) => {
        if (!collection && collection.length === 0) return [];
        if (orders === 'desc') {
            return Array.prototype.sort.call(collection, function (a, b) {
                return a[key] < b[key]
            })
        } else {
            return Array.prototype.sort.call(collection, function (a, b) {
                return a[key] > b[key]
            })
        }
    };

    const find = (collection, key, value) => {
        if (!collection && collection.length === 0) return [];
        for (let i = 0; i < collection.length; i++) {
            if (collection[i] && collection[i][key] == value) {
                return collection[i];
            }
        }
        return [];
    };

    let numToChinese = (num) => {
        var unitOfLendth = ['', '十', '百', '千', '万', '十万', '百万', '千万', '亿', '十亿', '百亿'];
        var CN_Num = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
        let _num = num + ''.split(',')[0];
        let _result = '';
        while (_num.length !== 1) {
            _result += CN_Num[_num[0]];
            _result += _result !== '' && CN_Num[_num[0]] !== CN_Num[0] ? unitOfLendth[_num.length - 1] : '';
            _num = _num.slice(1);
        }
        _result += CN_Num[_num[0]];
        let pattern = new RegExp(CN_Num[0] + "{2,}", "g");
        _result = _result.replace(pattern, CN_Num[0]);
        _result = _result.slice(-1) === CN_Num[0] ? _result.slice(0, -1) : _result;
        let pattern1 = new RegExp('^一十', "g");
        _result = _result.replace(pattern1, '十');

        _result = regUntillLast(_result, '亿', '');
        _result = regUntillLast(_result, '万', '');

        return _result;
    }

    let regUntillLast = (str, regexp, rep) => {
        let pattern = RegExp(regexp + "(?=.*" + regexp + ")", 'g');
        return str.replace(pattern, rep);
    }

    let CssStyle = (function () {
        let dynamicFont = (name, url) => {
            let style = document.createElement('style');
            style.type = 'text/css';
            document.getElementsByTagName('head')[0].appendChild(style);

            let cssText = `@font-face{font-family:'${name}';font-style:normal;src:url(${url}) format('woff');`;
            let textNode = document.createTextNode(cssText);
            style.appendChild(textNode);
        };

        return {
            dynamicFont,
        }
    })();

    function shalloEqual(prev, next) {
        if (prev === next) return true;
        const prevKeys = Object.keys(prev);
        const nextKeys = Object.keys(next);

        if (prevKeys.length !== nextKeys.length) return false;

        return prevKeys.every((key) => {
            return prevKeys.hasOwnProperty(key) && prevKeys[key] === nextKeys[key];
        })

    }

    return {
        shalloEqual,
        CssStyle,
        numToChinese,
        log: log,
        isLogEnabled: isLogEnabled,
        enableLog: enableLog,
        str,
        date,
        url,
        array,
        isIOS,
        setWXTitle,
        orderBy,
        find
    };
})();

export default U;
