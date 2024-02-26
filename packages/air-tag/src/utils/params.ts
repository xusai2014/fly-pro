import {
  readCookie,
  setCookie
} from './cookie.js';

import {
  Encode,
  getDeviceType
} from './common.ts';

/**
 * 生成loadId
 * @param {Number} 生成loaded的位数
 * @return {String} 生成的loadId
*/
const getLoadId = function (len) {
  const randChar = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let r = "";
  for (let i = 0; i < len; i++) {
    let index = parseInt(Math.random() * Math.pow(10, 6), 10) % randChar.length;
    r += randChar[index];
  }
  return new Date().getTime() + r;
};

/**
 * @description 获取上一次 PV 请求的ahrlid
 * 当前时间距上一次的时间超过10s，返回上一次的 ahrlid
 * @return {String} ahrlid
*/
const getRLoadId = function () {
  let logRLoadId = readCookie('ahrlid') || '';
  if (logRLoadId === '') return '';
  logRLoadId = logRLoadId.split('-');
  if (new Date().getTime() - parseInt(logRLoadId[1], 10) > (10 * 1000)) return '';
  return logRLoadId[0] || "";
}

/**
 * @description 生成UUID
 * @return {String} 生成的UUID
*/
const UUID = function () {
  const s = [];
  const hexDigits = "0123456789ABCDEF";
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";
  const uuid = s.join("");
  return uuid;
}

/**
 * @description 将参数拍平，拼接成GET请求形式
 * @param {Object} obj 当前请求参数
 * @return {String} 拍平之后的参数形式
 **/
const GETPARAM = function (obj) {
  const arr = [];
  for (let i in obj) {
    if (obj.hasOwnProperty(i)) {
      arr.push(Encode(i) + "=" + Encode(obj[i]));
    }
  }
  return arr.join("&");
}

/**
 * @description 将参数转成对象形式
 * @param {Object} url 当前请求参数
 * @return {String} 拍平之后的参数形式
 **/
const parseQueryString = function (url) {
  const obj = {};
  let keyvalue = [];
  let key = "",
      value = "";
  const Qindex = url.indexOf('?');
  if (Qindex === -1) {
    return {}
  }
  const parseString = url.substring(Qindex + 1, url.length).split("&");
  console.log(parseString)
  for (let i in parseString) {
      keyvalue = parseString[i].split("=");
      key = keyvalue[0];
      value = keyvalue[1];
      obj[key] = value;
  }
  return obj;
}

/**
 * @description 更新pv序号, 主要应用上报pv前更新一次
 * @returns {Null}
*/
const updatePvNum = function () {
  let pvNum = readCookie("ahpvno");
  if (!pvNum || pvNum == 9999) {
    pvNum = 1
  } else {
    pvNum++;
  }
  setCookie("ahpvno", pvNum, 86400);
};

/**
 * 获取 pv
 * @param {String} ids
 */
const getPvTrack = function (ids) {
  if (ids) {
    const splitIds = ids.split(',');
    if (splitIds.length === 2) {
      if (getDeviceType().isPc) {
        splitIds.unshift('138');
      } else {
        splitIds.unshift('1211138');
      }
    }
    return splitIds;
  }
  const { category, subcategory } = this.pvTrack;
  const site = getDeviceType().isPc ? 138 : 1211138;
  return [site, category, subcategory];
}

export {
  getLoadId,
  getRLoadId,
  UUID,
  GETPARAM,
  updatePvNum,
  getPvTrack,
  parseQueryString
}
