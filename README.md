## fly-pro



### 项目框架

### 技术栈


### 代码治理方法

- 项目子集

```shell
git submodule add git@github.com:xusai2014/next-site.git next

git submodule update --init --recursive
```


- lerna分包

    ```lerna & nx```

(lerna)[https://lerna.js.org/]  
(commitment)[https://commitizen-tools.github.io/commitizen/]

```shell
## 创建新包
lerna create XXX
pnpm add @types/node -D
```
