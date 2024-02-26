export interface IHtmlNode {
    [key: string]: any;
}
export interface IFindKeyNodeParamsOptions {
    eventName: string; // 指定事件名，不传则代表支持所有事件
    objectType: string; // 指定节点类型，page表示页面、element表示元素、不传或其他表示所有
}


export interface IDataLog {
    oid: string;

    isPage?: boolean;
    events?: string[];
    params?: any;
    virtualParentNode?: any;
    mountParentSelector?: string;
    useForRefer?: string[] | boolean;

    // RN参数兼容
    pageId?: string;
    elementId?: string;
    rootpage?: boolean;
    key?: string;
}
