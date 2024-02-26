import {
  ExposureObserver as Exposure
} from '../plugins/index.ts';

import type {
  IFindKeyNodeParamsOptions, IHtmlNode, IDataLog
} from "../types/index.d.ts";
import {isBoolean, getWindow, isObject, isArray} from "../utils/index.ts";

const EVENT_NAME_MAP = {
  event_click: ''
}

const DEFAULT_LOG_PARAMS = {
  oid: '',
  isPage: false,
  events: [],
  params: {},
};

const formatDataLog = (stringParams: string): IDataLog => {
  if (!stringParams) return DEFAULT_LOG_PARAMS;

  let objectParams = null;

  if (isObject(stringParams)) {
    objectParams = stringParams;
  } else {
    try {
      objectParams = JSON.parse(stringParams);
    } catch (error) {
      callHook('error', '埋点参数：反序列化失败出错', {
        code: 'dataLog', error, dataLogType: 'parse', dataLog: stringParams,
      });
    }
  }

  if (!isObject(objectParams)) return DEFAULT_LOG_PARAMS;
  if (objectParams?.oid) return objectParams;

  const { pageId, elementId } = objectParams || {};

  if (pageId || elementId) {
    return {
      oid: pageId || elementId,
      isPage: !!pageId,
      ...objectParams,
    };
  }

  return DEFAULT_LOG_PARAMS;
};

const formatEvents = (events: string[], isPage: boolean): string[] => {
  const { isDefaultReportEd } = getConfig();
  const defaultEvents = isPage
      ? [EVENT_NAME_MAP.pv, EVENT_NAME_MAP.pd]
      : (isDefaultReportEd ? [EVENT_NAME_MAP.ev, EVENT_NAME_MAP.ed] : [EVENT_NAME_MAP.ev]);

  return isArray(events) ? events : defaultEvents;
};


// 获取节点上的埋点参数（object）
const getDataLog = (target: IHtmlNode, isUpdate?: boolean): IDataLog => {
  if (!target) return DEFAULT_LOG_PARAMS;

  let logParams: IDataLog = target?.[OBJ_PARAMS_KEY];

  if (isUpdate === true) {
    const stringParams: string = target?.attributes?.[ATTRIBUTE_KEY]?.value;

    if (stringParams) {
      logParams = formatDataLog(stringParams);
    }
  }

  if (!logParams?.oid) {
    const stringParams: string = target?.attributes?.[ATTRIBUTE_KEY]?.value;

    if (!stringParams) return DEFAULT_LOG_PARAMS;

    logParams = formatDataLog(stringParams);
  }

  const { isPage, events, params } = logParams;
  const currentIsPage = isBoolean(isPage) ? isPage : false;

  return {
    ...logParams,
    isPage: currentIsPage,
    events: formatEvents(events, currentIsPage),
    params: isObject(params) ? params : {},
  };
};


// 当前节点是否关键节点
const isKeyNode = (target: IHtmlNode): boolean => {
  const { oid } = getDataLog(target) || {};

  return isString(oid) && !!oid;
};

// 查找父级关键节点
const findParentKeyNode = (target: IHtmlNode): IHtmlNode => {
  const parent = target?.parentNode;

  if (parent && isKeyNode(parent)) return parent;
  if (!parent) return null;

  return findParentKeyNode(parent);
};
const findKeyNode = (target: IHtmlNode, options?: IFindKeyNodeParamsOptions): IHtmlNode => {
  const { eventName, objectType } = options || {};
  let objectTypeList = [true, false]; // 节点类型，[true]表示仅页面、[false]表示仅元素、[true, false]表示页面及元素

  if (objectType === 'page') {
    objectTypeList = [true];
  } else if (objectType === 'element') {
    objectTypeList = [false];
  }

  while (target) {
    if (isKeyNode(target)) {
      const { events, isPage } = getDataLog(target);

      if (objectTypeList.includes(isPage) && (!eventName || events.includes(eventName))) {
        return target;
      }
    }

    target = findParentKeyNode(target);
  }

  return null;
};

/**
 * SDK事件处理
 * 处理事件相关逻辑，如点击事件、曝光事件、异步请求触发事件
 * @param {Function} Tracker 构造函数
 * @return {Null}
 **/
export function initEvents(Tracker) {

  /**
   * @return {Null}
  */
  Tracker.prototype.clickEvent = function (obj, timer) {
    getWindow('document')?.addEventListener?.('click', (e: any) => {
      const eventName = EVENT_NAME_MAP.event_click;
      const target = e?.nativeEvent?.target || e?.target;
      const $object = findKeyNode(target, { eventName, objectType: 'element' });

      // TODO
      if(this.triggerForPosition($object)){
        const data = this.getActionData($object)
        const type = this.getActionsType($object)
        this.report_track(type, data)
      }


    }, false);
  }

  /**
   * @description 绑定异步事件触发器
   * @return {Null}
  */
  Tracker.prototype.asyncEvent = function () {
    // TODO
  }

  /**
   * @descoration 挂载曝光事件
   * @param {Element | String} ele 要检测曝光的节点, 支持传入节点或者节点属性
   * @param {Object | Function}  dataFn 当节点曝光时，要发送的数据
   * @return {Null}
  */
  Tracker.prototype.exposureOberver = function (ele, dataFn) {
    const elements = ele.nodeType !== 1 ? document.querySelectorAll(ele) : [ele];
    Array.prototype.forEach.call(elements, (item) => {
      let exposureIns = null;
      // TODO: 曝光类可在信息流参数改造阶段进行调整，单实例即可。
      exposureIns = new Exposure(() => {
        if (typeof dataFn === 'function') {
          dataFn = dataFn() || {};
        }

        if(this.triggerForPosition($object)){
          const data = this.getActionData($object)
          const type = this.getActionsType($object)
          this.report_track(type, data)
        }
        // 曝光检测执行完，将当前实例置为 null
        exposureIns = null;
      });
      exposureIns.observe(item);
    })
  }
}
