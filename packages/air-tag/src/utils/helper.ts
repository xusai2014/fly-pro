export const isWindow = () => typeof window !== 'undefined' && window;

export const getWindow = (name?: string): any => {
    if (!isWindow()) return null;
    if (name) return window?.[name];

    return window;
};

export const isObject = data => Object.prototype.toString.call(data) === '[object Object]';
export const isArray = data => Object.prototype.toString.call(data) === '[object Array]';
export const isString = data => typeof data === 'string';
export const isNumber = data => typeof data === 'number';
export const isBoolean = data => typeof data === 'boolean';
export const isFunction = data => typeof data === 'function';
