// 本地存储相关工具方法
export {
  storageSetItem,
  storageGetItem
} from './storage.ts';

// 请求方法
export {
  sendByForm,
  sendByImage,
  getConfigJson
} from './sendMethod.ts';

// Cookie 相关工具方法
export {
  readCookie,
  setCookie,
  removeCookie,
  disableCookie,
  getCookieExpires,
  hostIsNew,
  hostIsDe
} from './cookie.ts';

// 埋点 SDK 参数相关
export {
  getLoadId,
  getRLoadId,
  UUID,
  GETPARAM,
  updatePvNum,
  getPvTrack,
  parseQueryString,
} from './params.ts';

export {
  getEventParam,
  getPvParam,
  IsEmpty,
  parseUri,
  getPageVars,
  updateRef,
  getUrlParam,
  getUploadType,
  stringEncode,
  stringDecode,
} from './common.ts';

export {
  DEFAULT_COLLECTORS
} from './collectors.ts'
export {
  ErrorTypes,

} from './error.ts'

export {
  logger
} from './logger.ts'

export * from './helper.ts'
