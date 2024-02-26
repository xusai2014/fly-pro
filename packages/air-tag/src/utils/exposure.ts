/** 监测元素是否在祖先元素内曝光 */
class ExposureObserver {
  /**
   * @param {Function} callback 一段时间内的元素曝光统一执行回调函数（由可选配置属性 `time` 设定，默认为 `1000` 毫秒），其参数返回所有曝光的元素数组
   * @param {Object} options 一个可以用来配置曝光实例的对象，你可以指定以下配置：
   *        @param {selectors|HTMLElement} options.root 监测元素的祖先元素Element对象，其边界盒将被视作视口（默认 `window`）
   *        @param {string} options.rootMargin 一个在计算曝光时添加至root元素的边界盒（默认为空）
   *        @param {number} options.time 指定曝光回调间隔时间（单位毫秒，默认 `1000`）
   *        @param {number} options.poll 当实例化后，以 time/2 的间隔持续检测多少次（默认 `2` 次）
   *        @param {number} options.ratio 规定了一个监测元素与边界盒交叉区域的比例值（默认 `0`）
   *        @param {Function} options.step 元素曝光后执行回调函数，其参数为元素本身
   */
  constructor(callback, options) {
    this.callback = callback;
    this.initialize(options);
    this.handleEvent();
    this.pollingCheck();
  }

  initialize(options = {}) {
    if (!options.root) {
      this.root = window;
    } else {
      this.root = options.root.nodeType !== 1 ? document.querySelector(options.root) : options.root;
    }

    this.rootMargin = options.rootMargin !== undefined ? options.rootMargin : '';
    this.time = options.time !== undefined ? options.time : 1000;
    this.poll = options.poll !== undefined ? options.poll : 2;
    this.ratio = options.ratio !== undefined ? options.ratio : 0;
    this.step = options.step !== undefined ? options.step : (() => { });

    this.entries = []; // 待监测的元素集合
    this.records = []; // 一段时间内曝光的元素集合
    this.rootRect = this.root === window ? {
      top: 0,
      left: 0,
      bottom: document.documentElement.clientHeight || window.innerHeight,
      right: document.documentElement.clientWidth || window.innerWidth,
      width: document.documentElement.clientWidth || window.innerWidth,
      height: document.documentElement.clientHeight || window.innerHeight,
    } : (() => {
      const {
        top,
        left,
        bottom,
        right,
        width,
        height,
      } = this.root.getBoundingClientRect();
      return {
        top,
        left,
        bottom,
        right,
        width,
        height,
      };
    })();
    this.setRootMargin();
  }

  /**
   * 对root元素增加额外的边界盒
   */
  setRootMargin() {
    if (!this.rootMargin) { return; }

    const {
      width, height, top, left,
    } = this.rootRect;
    const [mt, mr, mb, ml] = this.rootMargin.split(/\s/);

    const setMargin = (n1, n2) => {
      const num = parseInt(n1, 10);

      if (/%/.test(n1)) {
        return ((num / 100) * n2);
      }

      if (num === 0) {
        return 0;
      }

      return (num + n2);
    };

    this.rootRect.top = top - setMargin(mt, height);
    this.rootRect.right = width + setMargin(mr, width);
    this.rootRect.bottom = height + setMargin(mb, height);
    this.rootRect.left = left - setMargin(ml, width);
  }

  /**
   * 初始化事件
   */
  handleEvent() {
    this.listener = true;
    this.root.addEventListener('scroll', this.pollingCheck.bind(this));
    this.root.addEventListener('resize', this.pollingCheck.bind(this));
  }

  /**
   * 检测单个元素是否曝光
   */
  isIntersecting(target) {
    const targetRect = target.getBoundingClientRect();
    const height = targetRect.height * this.ratio;
    const width = targetRect.width * this.ratio;

    if (!targetRect.height || !targetRect.width) {
      return false;
    }

    if (
      targetRect.top + height <= this.rootRect.bottom
      && targetRect.bottom - height >= this.rootRect.top
      && targetRect.left + width <= this.rootRect.right
      && targetRect.right - width >= this.rootRect.left
    ) {
      return true;
    }

    return false;
  }

  /**
   * 检测目标元素是否曝光
   */
  checkForIntersections() {
    if (!this.entries.length) { return; }

    this.entries.forEach((entry, index) => {
      if (this.isIntersecting(entry)) {
        this.entries.splice(index, 1);
        this.records.push(entry);
        this.step(entry);
      }
    });

    this.takeRecords();
  }

  /**
   * 持续多次检测目标元素是否曝光
   */
  pollingCheck() {
    this.checkForIntersections();

    let count = 0;
    clearInterval(this.polling);

    this.polling = setInterval(() => {
      count += 1;

      if (
        !this.entries.length
        || count > this.poll
      ) {
        clearInterval(this.polling);
        this.polling = null;
        return;
      }

      this.checkForIntersections();
    }, this.time / 2);
  };

  /**
   * 一段时间内的元素曝光统一执行回调函数
   */
  takeRecords() {
    if (this.timer) { return; }

    this.timer = setTimeout(() => {
      if (this.records.length) {
        this.callback(this.records);
        this.records = [];
      }

      this.timer = null;

      if (!this.entries.length) {
        this.disconnect();
      }
    }, this.time);
  }

  /**
   * 向曝光对象监测的目标集合添加一个元素
   */
  observe(target) {
    if (target.nodeType !== 1) {
      target = document.querySelector(target);
    }

    if (!this.listener) {
      this.handleEvent();
    }

    if (this.isIntersecting(target)) {
      this.step(target);
      this.records.push(target);
    } else {
      this.entries.push(target);
    }

    this.takeRecords();
  }

  /**
   * 终止对所有目标元素可见性变化的观察
   */
  disconnect() {
    clearInterval(this.polling);
    clearTimeout(this.timer);
    this.polling = null;
    this.timer = null;
    this.entries = [];
    this.records = [];
    this.listener = false;

    this.root.removeEventListener('scroll', this.pollingCheck);
    this.root.removeEventListener('resize', this.pollingCheck);
  }
}

export default ExposureObserver;
