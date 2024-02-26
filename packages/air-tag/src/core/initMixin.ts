import {
  ErrorTypes, getConfigJson, logger
} from '@utils';

interface Options {
  base_data: {
    [key: string | symbol]: any
  },
  config: {
    rules_url
  },
  report_track: (string, data)=> void,  // 自定义上报方法
  // TODO 1. quick、2.login
}


/**
 * SDK初始化
 * @param {Function} 构造函数
 * @return {Null}
 **/
export  function initMixin(Tracker) {
  /**
   * 1. 挂载自定义上报方法
   * 2. 引用公共参数
  */
  Tracker.prototype._init = function ({report_track, base_data = {}, config}:Options) {

    /** 打包时间，用于根据版本跟踪问题 **/
    this.__time__ = '__BUILD__TIME__';
    this.__version__ = '__VERSION__';

    /** 自定义上报方法 **/
    this.report_track = report_track || function () {
      logger.error(ErrorTypes.REPORT_TRACK_NOT_FOUND)
      return;
    }
    /** 上报公共参数 **/
    this.base_data = base_data || {}

    /** SDK 配置对象 **/
    this.config = config

    // 加载配置数据
    this.loadConfig();

    // 挂载全局API
    this.bindGlobalAPI();

    return this;
  }

  /**
   * 加载远程规则配置
  */
  Tracker.prototype.loadConfig = function () {
    try {
      if(!this.config.rules_url) {

      }
      logger.info('-------开始加载配置-------')
      const startTime = new Date();
      getConfigJson(this.config.rules_url,function (data) {
        this.rules = data
        logger.info('-------加载配置成功-------',`耗时：${new Date() - startTime} 毫秒`)
      })
    } catch (error) {
      logger.error(error);
    }
  }

  /**
   * 将全局API暴露给window，
  */
  Tracker.prototype.bindGlobalAPI = function () {
    window.loadAirTagConfig = this.loadConfig.bind(this);

  }

  /**
   * 订阅可用于配置化使用的数据层
  */
  Tracker.prototype.dataLayer = function (data) {

  }
}
