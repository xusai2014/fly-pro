/**
 * 挂载扩展工具，如：
 * 1. 校验工具（已接入）
 * @param {Function} 构造函数
 * @return {Null}
 **/
export function initTools(Tracker) {

  /**
   * @description 工具校验
   * 该方法会在请求数据前调用执行，
   * 目前只会在开发环境、测试环境、仿真环境进行数据校验并收集
   * @param {Object} data 需要校验的数据
   * @returns {Null}
   */
  Tracker.prototype.verifyByAssistant = function (data) {
   // TODO
  }
}
