import { initMixin, initMain, initEvents, initTools, initSend } from '@core';
import { isWindow, logger } from "@utils";

(function (global) {

    if (!isWindow()) {
        logger.error('初始化：失败，不在浏览器环境');
        return false;
    }
    function AutoTracker():void {
        return this._init();
    }

    // 挂载初始化方法
    initMixin(AutoTracker);

    // 挂载主API
    initMain(AutoTracker);

    // 绑定事件
    initEvents(AutoTracker);

    // 挂载请求方法主体
    initSend(AutoTracker);

    // 挂载扩展工具: 埋点校验工具、GTM / GA360
    // 注释埋点检验工具暂停
    initTools(AutoTracker);

    // 暴露 __AUTO__TRACKER__ 到全局，
    // 方便在线上环境对 SDK 的运行时进行调试
    global.__AUTO__TRACKER__ = new AutoTracker();

}(window));
