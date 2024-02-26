/**
 * Cookie 操作相关工具类
 */

/**
 * @description 读取cookie
 * @param {String} key 读取的key
 * @param {String} defaultVal 默认值
 * @return {String} 读取到的Cookie的值
*/
const readCookie = function (key, defaultVal = '') {
  const reg = new RegExp("(^| )" + key + "=([^;]*)(;|$)");
  const r = document.cookie.match(reg);
  if (r != null) {
    return decodeURIComponent(r[2]);
  }
  return defaultVal;
};


/**
 * @description 校验cookieBanner是否有效
 * @return {Boolean} 是否得到用户授权
 */
const disableCookie = function () {
  return readCookie('cookie_banner') && readCookie('cookie_banner').indexOf('4') === -1;
};

/**
 * @description 设置当前Cookie有效期
 * @return {String} 当前Cookie的有效期
 */
const getCookieExpires = function (timeout) {
  const date = new Date;
  timeout = new Date(date.getTime() + timeout * 1000);
  return "expires=" + timeout.toGMTString() + "; ";
}



const defaultDomain = function () {
  return hostIsNew() ? (hostIsDe() ? '.de' : '.co.uk') : '.com';
}


/**
 * @description 设置cookie
 * @param {String} key 读取的key
 * @param {String} value 需要设置的Cookie值
 * @param {String} timeout 当前Cookie有效期
 * @param {String} domain 设置Cookie域
 * @return {Null}
 */
const setCookie = function (key, value, timeout, domain = defaultDomain()) {
  try {
    if (disableCookie()) {
      return 'disable'
    }
    let cookie = timeout > 0 ? getCookieExpires(timeout) : "";
    let keyValue = key + "=" + value;
    if (keyValue.length > 256) {
      keyValue = keyValue.substring(0, 256);
    }
    cookie = keyValue + "; path=/; " + cookie + "domain=" + domain + ";";
    document.cookie = cookie;
  } catch (r) { }
};

/**
 * @description 清除cookie
 * @param {String} key 读取的key
 * @return {null}
 */
const removeCookie = function (key, domain = defaultDomain()) {
  const expires = new Date().toUTCString();
  document.cookie = key + "=; path=/; expires=" + expires + "; domain=" + domain + ";";
};

export {
  readCookie,
  setCookie,
  removeCookie,
  disableCookie,
  getCookieExpires,
}

