import * as fs from 'fs'

enum MARK_MODE {
  JSON = 'json',
  PROPERTIES = 'properties',
}

const ERROR_PREFIX = '错误：自动化埋点转换插件报错:'
const configMap = new Map()
const DEFAULT_PATH_REG = new RegExp(/\/src\/(.*)(\/[^/]+\.(vue|ts|tsx))$/)
const DEFAULT_JSON_RULES = '/src/$1/dRaw.json'
const DEFAULT_MODE = MARK_MODE.JSON
const DEFAULT_LAYOUT_KEY = 'data-element'

function traverseDataSets(config, addDataSet, nodeName = 'data') {
  if (typeof config === 'object') {
    Object.keys(config).forEach(key => {
      traverseDataSets(config[key], addDataSet, `${nodeName}-${key}`)
    })
    return
  }
  addDataSet(nodeName, config)
}

export default function (babel) {
  const { types: t } = babel
  return {
    visitor: {
      Program: {
        enter(path, state) {
          const { pathReg: str1, jsonRule: str2 } = state?.opts || {}
          let pathReg = DEFAULT_PATH_REG
          let jsonRule = DEFAULT_JSON_RULES
          if (str2 && str1) {
            pathReg = new RegExp(str1)
            jsonRule = str2
          }
          try {
            if (pathReg.test(this.filename)) {
              const cfgPath = this.filename.replace(pathReg, jsonRule)
              if (fs.existsSync(cfgPath)) {
                const json = fs.readFileSync(cfgPath, 'utf8')
                if (json) {
                  configMap.set(this.filename, JSON.parse(json))
                }
              }
            }
          } catch (e) {
            throw Error(ERROR_PREFIX + e.message)
          }
        },
      },
      ObjectProperty: {
        enter(path, state) {
          const { mode, layoutKey } = state?.opts || {}
          const nodeKey = layoutKey ?? DEFAULT_LAYOUT_KEY
          try {
            if (path.node?.key?.value === nodeKey) {
              const data = configMap.get(this.filename)
              if (path.node?.value?.value && data) {
                const config = data[path.node?.value?.value]
                if (!config || !path.node?.value?.value) {
                  return
                }

                const mark_mode = mode ?? DEFAULT_MODE
                if (mark_mode === MARK_MODE.JSON) {
                  path.node.value.value = JSON.stringify(config)
                } else if (mark_mode === MARK_MODE.PROPERTIES) {
                  // 方案 解析配置，映射到具体dataset
                  traverseDataSets(config, function (nodeName, value) {
                    path.parent.properties.push(
                      t.objectProperty(
                        t.identifier(`"${nodeName}"`),
                        t.stringLiteral(value),
                      ),
                    )
                  })
                }
              }
            }
          } catch (e) {
            throw Error(ERROR_PREFIX + e.message)
          }
        },
      },
    },
    pre() {
      // console.log('exit')
    },
  }
}
