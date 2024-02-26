/**
 * @description 本地存储 Set 方法
 * @param {String} key 要设置的 key
 * @param {Any} value 要设置的值
 * @param {Object} type 存储类型：localStorage / sessionStorage
 * @return {Null}
*/
const storageSetItem = function (key, value, type = 'local') {
  try {
    const storgeType = type === 'local' ? localStorage : sessionStorage;
    storgeType && storgeType.setItem(key, JSON.stringify(value));
    return value
  } catch (error) {
    console.error(error);
  }
};

/**
 * @description 本地存储 Get 方法
 * @param {String} key 要获取的 key
 * @param {String} defVal 获取不到值的情况下返回的默认值
 * @param {Object} type 存储类型：localStorage / sessionStorage
 * @return {Any} 获取到的值
*/
const storageGetItem = function (key, defVal, type = 'local') {
  try {
    const storgeType = type === 'local' ? localStorage : sessionStorage;
    const value = storgeType.getItem(key);
    if (value === null || value === 'undefined' || value === '') {
      return defVal;
    }
    return JSON.parse(value);
  } catch (error) {
    console.error(error);
  }
};

export {
  storageSetItem,
  storageGetItem
}