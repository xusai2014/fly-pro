// 浏览器日志打印
export const info = (title: string, ...args): void => {
    console.log(`[air-tag]: ${title}`, ...args);
};

// 浏览器警告日志打印
export const warn = (title: string, ...args): void => {
    console.warn(`[air-tag]: ${title}`, ...args);
};

export const error = (title: string, ...args): void => {
    if (args?.length === 1 && isString(args?.[0])) {
        console.error(`[air-tag]: ${title}`, new Error(args[0]));
    } else {
        console.error(`[air-tag]: ${title}`, ...args);
    }
};
export const logger = {
    error,
    warn,
    info
}
