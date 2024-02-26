import assign from 'object-assign';
import {
  readCookie,
  setCookie
} from './cookie.ts';
import {
  storageSetItem,
  storageGetItem
} from './storage.ts';

/**
 * @description 判断是不是空
 * @param {String} o 需要校验的字符串
 * @return {Boolean}
*/
const IsEmpty = (o) => { undefined == o || "-" == o || "" == o; };

/**
 * @description 编码
 * @return {String} 编码之后的字符串
*/
const Encode = function (uri, isAll) {
  const _encode = encodeURIComponent;
  if (_encode instanceof Function) {
    return isAll ? encodeURI(uri) : encodeURIComponent(uri);
  } else {
    return escape(uri);
  }
};


/**
 * @description 判断是不是主软App
 * @return {Boolean}
*/
const IsAutohomeApp = function () {
  let ua = navigator.userAgent;
  let co = document.cookie;
  let ur = /auto_(iphone|android)(;|%3B|\/)(\d+\.\d+\.\d+)/i;
  let cr = /.*app_key=auto_(iphone|android)(.*)app_ver=(\d+\.\d+\.\d+)/i;
  return /autohomeapp/.test(ua) || ur.test(ua) || cr.test(co);
};

/**
 * @description 解析URL参数
 * @param {String} 传入的url地址
 * @return {Null}
 **/
const parseUri = function (str) {
  const o = {
    strictMode: true,
    key: ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"],
    q: {
      name: "queryKey",
      parser: /(?:^|&)([^&=]*)=?([^&]*)/g,
    },
    parser: {
      strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
      loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
    }
  };
  const m = o.parser[o.strictMode ? "strict" : "loose"].exec(str);
  const uri = {};
  let i = 14;
  while (i--) uri[o.key[i]] = m[i] || "";
  uri[o.q.name] = {};
  uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
    if ($1) uri[o.q.name][$1] = $2;
  });
  return uri;
};

/**
 * @description 获取UUID
 * @return {String}
*/
const getAhUUID = function () {
  let auto_session_id = "";
  let auto_user_login_id = "";
  if (IsAutohomeApp()) {
    auto_session_id = readCookie("app_deviceid");
    auto_user_login_id = readCookie("app_userid");
  } else {
    auto_session_id = readCookie("sessionid");
    auto_user_login_id = readCookie("autouserid");
  }
  let ah_uuid = readCookie("__ah_uuid_ng");
  if (IsEmpty(ah_uuid)) {
    if (IsEmpty(auto_user_login_id)) {
      if (IsAutohomeApp()) {
        ah_uuid = auto_session_id ? "d_" + auto_session_id : "";
      } else {
        ah_uuid = auto_session_id ? "c_" + auto_session_id.split("||")[0] : "";
      }
      setCookie("__ah_uuid_ng", ah_uuid, 24 * 3600 * 365 * 10);
    } else {
      ah_uuid = "u_" + auto_user_login_id;
      setCookie("__ah_uuid_ng", ah_uuid, 24 * 3600 * 365 * 10);
    }
  } else {
    if (auto_user_login_id && ah_uuid != "u_" + auto_user_login_id) {
      ah_uuid = "u_" + auto_user_login_id;
      setCookie("__ah_uuid_ng", ah_uuid, 24 * 3600 * 365 * 10);
    }
  }
  return ah_uuid;
};

/**
 * @description 获取Pvareaid工具类方法
 * @return {Null}
*/
const getPvareaid = function () {
  let url_pvareaid = 0;
  let cookie_pvareaids = "";
  let reg = new RegExp("(^|&|#)pvareaid=([0-9]*)", "i");
  let r = window.location.search.substr(1).match(reg);
  if (r != null) {
    url_pvareaid = unescape(r[2]);
  }
  try {
    if (url_pvareaid && url_pvareaid > 0) {
      cookie_pvareaids = readCookie('pvidchain');
      if (IsEmpty(cookie_pvareaids)) {
        cookie_pvareaids = url_pvareaid;
      } else {
        cookie_pvareaids += ',' + url_pvareaid;
        const count = cookie_pvareaids.match(/,/g).length;
        if (count > 9) {
          const pos = cookie_pvareaids.indexOf(',');
          cookie_pvareaids = cookie_pvareaids.substr(pos + 1);
        }
      }
      setCookie('pvidchain', cookie_pvareaids, 1800);
    } else {
      cookie_pvareaids = readCookie('pvidchain');
    }
  } catch (e) {
    cookie_pvareaids = 'err';
  };
  return cookie_pvareaids;
};

/**
 * @description 从页面 URL 中获取广告参数，并追加到埋点上报扩展参数中
 * 广告参数规则： _ads_参数名
 * @returns {Object} 获取到的广告参数
*/
const getAdsParamsFromPageUrl = function(){
  const adsParams = {};
  const parseURLQuery = parseUri(window.location).queryKey || {};
  const isHasQuery = !!Object.keys(parseURLQuery).length;

  // 没有参数 直接返回空
  if(!isHasQuery) return adsParams;

  // 获取到广告参数
  Object.keys(parseURLQuery).forEach((key) => {
    if(/^_ads_/.test(key)){
      adsParams[key] = parseURLQuery[key];
    }
  })
  return adsParams;
};

/**
 * @description 获取自定义变量
 * @param {Function} callback
 * @return {Null}
*/
const getPageVars = function (callback) {
  const pvTrack = this.pvTrack || {};
  const cookie_pvareaids = getPvareaid();
  const _ah_user_token = getAhUUID();
  const adsPageVars = getAdsParamsFromPageUrl();
  const pgvar = {};

  // 合并原扩展参数
  const typeList = ['type', 'typeid', 'abtest', 'bcTypeId', 'site_ref'];
  typeList.forEach(ele => {
    if (pvTrack[ele] !== null) {
      pgvar['type'] = pvTrack[ele]
    }
  })

  // 合并广告扩展参数
  Object.assign(pgvar, adsPageVars);

  // 合并页面传入的扩展参数
  if (pvTrack.pageVars != null) {
    Object.assign(
      pgvar,
      pvTrack.pageVars,
      {
        _forwarded_views: readCookie('_forwarded_views', '-1'),
      }
    )
  }

  if (!IsEmpty(cookie_pvareaids)) pgvar['pvidchain'] = cookie_pvareaids;
  if (!IsEmpty(_ah_user_token)) pgvar['ah_uuid'] = _ah_user_token;
  callback && callback(JSON.stringify(pgvar));
};

/**
 * @description 基于pageLoadId 生成页面唯一ID错位符
 * @return {String} 页面唯一ID错位符
*/
const getSign = function () {
  if (!this.conf.pageLoadId) {
    return "noloadid";
  }
  return [this.conf.pageLoadId.substring(2, 10) >> 3, Math.random().toString().substring(2, 5)].join("");
};

/**
 * @description reffer TODO:
 * @return {Object}
*/
const referrer = function () {
  const oldRef = storageGetItem('oldreferrer', document.referrer, 'session');
  let newRef = "";
  const initreferrer = storageGetItem('initreferrer', '', 'session');
  if (initreferrer && initreferrer.split('$$$')[1] === location.href) {
    newRef = initreferrer.split('$$$')[0]
  } else if (storageGetItem('newreferrer', '', 'session') && storageGetItem('newreferrer', '', 'session') === location.href) {
    newRef = oldRef
  } else {
    newRef = storageGetItem('newreferrer', document.referrer, 'session');
  }
  let obj = {
    old: oldRef,
    new: newRef
  }
  return obj
}

/**
 * @description 获取设备的信息
 * @return {Null}
*/
const Client = function () {
  let oThis = this;
  let _empty = "-";
  let screen = window.screen;
  let navigator = window.navigator;
  oThis.screen = screen ? screen.width + "x" + screen.height : _empty;
  oThis.colorDepth = screen ? screen.colorDepth + "-bit" : _empty;
  oThis.charset = document.characterSet ? document.characterSet : document.charset ? document.charset : _empty;
  oThis.language = (navigator && navigator.language ? navigator.language : navigator && navigator.browserLanguage ? navigator.browserLanguage : _empty)["toLowerCase"]();
  oThis.cookieEnabled = navigator && navigator.cookieEnabled ? 1 : 0;
  oThis.docTitle = document.title ? document.title.substring(0, 126) : "";
  oThis.getClientInfo = function (method) {
    if (method) {
      return {
        ahpcs: oThis.charset,
        ahpsr: oThis.screen,
        ahpsc: oThis.colorDepth,
        ahpul: oThis.language,
        ahpce: oThis.cookieEnabled,
        ahpdtl: oThis.docTitle,
      }
    }
    return `&ahpcs=${Encode(oThis.charset)}&ahpsr=${oThis.screen}&ahpsc=${oThis.colorDepth}&ahpul=${oThis.language}&ahpce=${oThis.cookieEnabled}&ahpdtl=${Encode(oThis.docTitle)}`
  };
};


/**
 * @description 获取PV请求上报参数
 * @param {Object} obj
 * @return {Object} 合并之后的参数
*/
const getPvParam = function (obj) {
  const t = this.pvTrack || {};
  return assign(obj || {}, {
    ahpvers: this.conf.version,                 // SDK版本号
    ahpplid: this.conf.pageLoadId,              // 页面唯一ID
    ahpprlid: this.conf.rPageLoadId,            // 来源页面唯一ID
    ahpsign: getSign.call(this),                // 页面唯一ID错位符
    ref: referrer().new,                        //referrer通过session做的缓存
    cur: document.URL,                          //当前页面地址
    site: t.site || 0,                          // 一级栏目
    category: t.category || 0,                  //二级栏目
    subcategory: t.subcategory || 0,            // 三级栏目
    object: t.object || t.objectid || 0,        //
    series: t.series || t.seriesid || 0,        // 车系
    spec: t.spec || t.specid || 0,              // 车型
    level: t.level || 0,                        // 等级
    dealer: t.dealer || 0
  }, new Client().getClientInfo('post'))
};



/**
 * @description TODO:
 * @param {Object} eventObj
 * @return {Object}
*/
const getEventParam = function () {
  const param = {
    ahpvers: this.conf.version,
    ahpplid: this.conf.pageLoadId,
    ahpprlid: this.conf.rPageLoadId,
    ahpsign: getSign.call(this),
    ref: referrer().old,
    cur: document.URL,
    extends: JSON.stringify({ ah_uuid: readCookie('__ah_uuid_ng') })
  }
  if (this.pvTrack) {
    let paramArr = ['site', 'category', 'subcategory', 'object'];
    paramArr.forEach(ele => {
      if (this.pvTrack[ele] !== null) {
        param[ele] = this.pvTrack[ele]
      }
    })
  }
  return param
};

/**
 * @description 存储reffer
*/
const updateRef = function () {
  // 第一次进来的referrer进行存储进行站外用
  if (document.referrer && !storageGetItem('initreferrer', '', 'session')) {
    storageSetItem('initreferrer', Encode(document.referrer) + '$$$' + Encode(location.href), 'session');
  }
  let newreferrer = storageGetItem('newreferrer', '', 'session');
  if (location.href !== newreferrer) {
    storageSetItem('oldreferrer', newreferrer, 'session');
    storageSetItem('newreferrer', location.href, 'session');
  }
};


/**
 * @description 获取 URL 默认参数
 * @param {String} key 获取的key
 * @returns {String} 获取的值，默认返回 no
 **/
const getUrlParam = function (key) {
  const r = new RegExp(`${key}=([^&]*)(&|$)`, 'i');
  const { href } = window.location;
  return href.match(r) ? href.match(r)[1] : 'no';
}

/**
 * @decoration 判断宿主环境，从www项目中迁移
 **/
const getDeviceType = function (userAgent) {
  const ua = userAgent || navigator.userAgent;
  const isWindowsPhone = /(?:Windows Phone)/.test(ua);
  const isSymbian = /(?:SymbianOS)/.test(ua) || isWindowsPhone;
  const isAndroid = /(?:Android)/.test(ua);
  const isFireFox = /(?:Firefox)/.test(ua);
  const isChrome = /(?:Chrome|CriOS)/.test(ua);
  const isTablet = /(?:iPad|PlayBook)/.test(ua) || (isAndroid && !/(?:Mobile)/.test(ua)) || (isFireFox && /(?:Tablet)/.test(ua));
  const isPhone = /(?:iPhone)/.test(ua) && !isTablet;
  const isPc = !isPhone && !isAndroid && !isSymbian && !isTablet;
  return {
    isTablet,
    isPhone,
    isAndroid,
    isMobile: isPhone || isAndroid,
    isPc,
    isChrome,
    isFireFox,
  };
};

// 日期格式化
function formatDate(time, fmt = "yyyy-MM-dd hh:mm:ss") {
  // TODO 10位时间戳格式化
  let timeStr = time + "";
  if (timeStr.length < 13) {
    time = time * Math.pow(10, 13 - timeStr.length);
  }
  time = parseInt(time);
  if (isNaN(time)) {
    return "";
  }
  let date = new Date(time);
  let padLeftZero = str => {
    return ("00" + str).substr(str.length);
  };
  let doFormatDate = (date, fmt) => {
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        (date.getFullYear() + "").substr(4 - RegExp.$1.length),
      );
    }
    let obj = {
      "M+": date.getMonth() + 1,
      "d+": date.getDate(),
      "h+": date.getHours(),
      "m+": date.getMinutes(),
      "s+": date.getSeconds(),
    };
    for (let k in obj) {
      if (new RegExp(`(${k})`).test(fmt)) {
        let str = obj[k] + "";
        fmt = fmt.replace(
          RegExp.$1,
          RegExp.$1.length === 1 ? str : padLeftZero(str),
        );
      }
    }
    return fmt;
  };
  return doFormatDate(date, fmt);
};

/**
 * 获取 uploadType 是否为有效值
 * @param {Object.uploadType} 由项目传入的 uploadType
 * @return 返回有效上报类型
*/
function getUploadType ({ uploadType }) {
  return (uploadType && Array.isArray(uploadType)) ? uploadType : ['GA', 'compass'];
}

/**
 * 对字符串进行加密
 * stringEncodes('dasdsA$dfdsf2131') = "100&97&115&100&115&65&36&100&102&100&115&102&50&49&51&49"
 * stringEncodes(null) = null
 * stringEncodes(undefined) = undefined
 * stringEncodes({}) = {}
 * @param {String} str 需要加密的字符串
 * @returns {String} 加密过的字符串
 */
const stringEncode = (str) => {
  if (typeof str !== 'string') {
    return str;
  }
  return str.split('').map((i) => i.charCodeAt(0)).join('&');
};

/**
 * 对字符串进行解密
 * /^[&0-9]+$/.test("104&101&108&108&111&64&103&109&97&105&108&46&99&111&109") = true
 * /^[&0-9]+$/.test("asdad123") = false
 * @param {String} str 需要加密的字符串
 * @returns {String} 解密后的字符串
 */
const stringDecode = (str) => {
  if (typeof str !== 'string' || (!/^[&0-9]+$/.test(str))) {
    return str;
  }
  return String.fromCharCode(...str.split('&'));
};

export {
  formatDate,
  IsEmpty,
  Encode,
  parseUri,
  getPvareaid,
  getPageVars,
  getAhUUID,
  updateRef,
  getEventParam,
  getPvParam,
  referrer,
  getUrlParam,
  getDeviceType,
  getUploadType,
  stringEncode,
  stringDecode
}
