import {
  storageSetItem,
  storageGetItem,
  sendByForm,
  sendByImage,
  UUID,
  GETPARAM,
} from '@utils';

/**
 * SDK 发送数据
 * @param {Function} 构造函数
 * @return {Null}
 **/
export function initSend(Tracker) {

  /**
   * @description SDK请求数据方法体
   * @param {Object} obj 当前请求的参数主体
   * @param {String} cacheUuid 当前请求的唯一 id
   * @param {Boolean} isCache 是否需要对本次请求进行缓存处理
   * @returns {Null}
   **/
  Tracker.prototype.postData = function (obj, cacheUuid, isCache = true) {
    const { url, data = {}, type } = obj;
    const uuid = cacheUuid || UUID();
    const isPostRequest = type && type.toLocaleLowerCase() === 'post';
    
    // 当由本地存储中的埋点触发 post 时，无需再进行存储
    if (isCache && data.action && data.action !== 'heartbeat_stay_time') {
      const caches = storageGetItem('__TRACK_DATA__', {});
      const updateCaches = {
        ...caches,
        [uuid]: obj,
      }
      storageSetItem('__TRACK_DATA__', updateCaches);
    }

    if (isPostRequest) {
      // this.verifyByAssistant(data);
      this.requestQueue.postMessage((params) => {
        sendByForm(url, params, () => {
          const cache = storageGetItem('__TRACK_DATA__', {})
          if (cache[uuid]) {
            delete cache[uuid]
          }
          storageSetItem('__TRACK_DATA__', cache);
        })
      }, data);
    } else {
      sendByImage(url + '?' + GETPARAM(data), () => {
        const cache = storageGetItem('__TRACK_DATA__', {})
        if (cache[uuid]) {
          delete cache[uuid]
        }
        storageSetItem('__TRACK_DATA__', cache);
      })
    }
  }
}
