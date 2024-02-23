# `@fly/babel-plugin-track`

## 工具开发指南

现在语法降级方案，分三种 Typescript、Babel、TS+babel

C端工程多基于Babel语法降级，三方库多选用TS语法降级，当然存在混淆使用情况。

本方案基于babel的语法解析
https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md#toc-introduction



辅助工具
https://astexplorer.net/

语法

"pathReg": "/src/views/(.*)(/[^/]+.vue)$",
"jsonRule":"/src/views/$1/dRaw.json"
## Usage





| 配置        | 描述        | 默认   | 类型 | 备注           |
| ---------- | ---------- | ---------- | ---------- |--------------|
| pathReg  | 进行页面管理的模块匹配正则 | "/src/(.*)(/[^/]+.vue)$" |  string  | 与jsonRule同时存在 |
| jsonRule | 页面配置文件与模块映射关系 | "/src/(.*)(/[^/]+.vue)$" |  string  | 与pathReg同时存在 |
| mode     | 节点数据存储方式   | json                  |  string 枚举值 properties、json   |              |

pathReg jsonRule 必须同时存在


```
// .babelrc
{
  ...
  "plugins": [
    ["@fly/babel-plugin-layout", {
      "mode": "properties",
      "pathReg": "/src/(.*)(/[^/]+.vue)$",
      "jsonRule": "/src/$1/dRaw.json"
    }]
  ]
  ...
}

// /src/views/home/index.vue

<template>
  <div data-element="HOME_TOP_BLOCK">HOME PAGE</div>
</template>
<script setup>

</script>

// /src/views/home/dRaw.json

{
  "HOME_TOP_BLOCK": {
    "spm": {
      "id": "3789573858495"
    },
    "virtual": {
      "id": "578952343858498"
    }
  }
}

```
