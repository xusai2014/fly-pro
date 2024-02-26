/**
 * 用于 SDK 发送数据前的请求校验:
 * 当发送数据请求前，会对必要参数（三级栏目和 Cookie ）做数据校验，
 * 校验不通过会将请求缓存至栈中,
 * 当下一次校验通过的请求触发时，
 * 会将缓存到栈中的请求逐个发送,
 * 考虑到 DC 域名已升级 http2,
 * 这里没有考虑对并发请求的限制。
 **/

class RequestQueueCache {
  constructor() {
    // 缓存队列
    this.queueStack = [];
  }

  /**
   * @description 校验当前请求 cookie 是否有效
   * 这里认为，当 sessionid 存在并有效时 cookie 是正常的
   * @returns {Boolean} 当前 cookie 是否有效
   */
  validateCookie() {
    // return window.BDP_DC && window.BDP_DC.readCookie && !!window.BDP_DC.readCookie('sessionid');
    // 考虑到测试环境 sessionid涉及到域的问题，暂时对 cookie 进行全校验
    return !!document.cookie;
  }

  /**
   * @description 校验当前 1~3 级栏目是否有效
   * @param {Number} site 一级栏目，一般指站点 id
   * @param {Number} category 二级栏目
   * @param {Number} subcategory 三级栏目
   * @returns {Boolean} 当前请求的三级栏目是否有效
  */
  validateSiteId({
    site = '',
    category = '',
    subcategory = ''
  }) {
    return (!!site && !!category && !!subcategory);
  }

  /**
   * @description 发送埋点数据
   * @param {Function} sendMethod 发送数据埋点
   * @param {Object} data 用于埋点的数据，用于校验
   * @returns {Null}
  */
  postMessage(sendMethod = Function.prototype, data) {
    // 发送数据前先做埋点工具校验
    // this.checkTrackByTools(data);
    if (typeof sendMethod !== 'function') return;
    // 校验三级栏目
    const isValidateSiteId = this.validateSiteId(data);
    // 校验 Cookie
    const isValidateCookie = this.validateCookie();

    if (isValidateSiteId && isValidateCookie) {
      const { site, category, subcategory } = data;
      // 发送数据
      sendMethod(data);
      // 将之前缓存的异常数据重新提交
      this.checkStack({
        site,
        category,
        subcategory,
        site_id: site,
        category_id: category,
        sub_category_id: subcategory,
      });
    } else {
      // 缓存到堆栈中
      this.queueStack.push({
        sendMethod,
        params: data,
        errType: isValidateCookie ? 'siteIdErr' : 'cookieErr',
      });
    }
  }

  /**
   * @descoration 检查当前缓存的请求栈中是否有未发出去的数据
   * @param {Object} siteIds 获取到最新的三级栏目ids
  */
  checkStack(siteIds = {}) {
    while (this.queueStack.length) {
      const postItem = this.queueStack.shift();
      if (typeof postItem.sendMethod === 'function') {
        let params = { ...postItem.params } || {};
        if (postItem.errType === 'siteIdErr') {
          params = {
            ...params,
            ...siteIds,
          }
        }
        postItem.sendMethod(params);
      }
    }
  }
}

export default RequestQueueCache;

