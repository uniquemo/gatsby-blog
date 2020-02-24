---
title: webpack进阶篇(2)
date: 2020-02-04
description: Webpack的进阶用法，列举常见使用场景。
tags: ['webpack']
layout: blog-post
---

## webpack和Eslint结合

### 制定团队的eslint规范
- 不重复造轮子，基于eslint:recommend配置并改进
- 能够帮助发现代码错误的规则，全部开启
- 帮助保持团队的代码风格统一，而不是限制开发体验

### eslint如何执行落地?
- 和CI/CD系统集成（增加lint pipeline）
- 和webpack集成

### 本地开发阶段增加precommit钩子
- 安装husky：npm install husky --save-dev
- **增加npm script，通过lint-staged增量检查修改的文件**
```json
{
  "scripts": {
    "precommit": "lint-staged"
  },
  "lint-staged": {
    "linters": {
      "*.{js,scss}": ["eslint --fix", "git add"]
    }
  }
}
```

### webpack与eslint集成
**使用eslint-loader，构建时检查JS规范**。
安装：
- npm i eslint eslint-plugin-import eslint-plugin-react eslint-plugin-jsx-a11y -D
- npm i eslint-loader -D
- npm i babel-eslint -D
- npm i eslint-config-airbnb -D

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          'babel-loader',
          'eslint-loader'
        ]
      }
    ]
  }
}
```

**.eslintrc.js：**
```javascript
module.exports = {
  parser: 'babel-eslint',
  extends: 'airbnb',
  env: {
    browser: true,
    node: true
  },
  rules: {
  }
}
```


## webpack打包组件和基础库
webpack除了可以用来打包应用，还可以用来打包js库。

举个例子：实现一个大整数加法库的打包
- 需要打包压缩版和非压缩版
- 支持AMD/CJS/ESM模块引入，也可通过script标签直接引入
```javascript
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  entry: {
    'large-number': './src/index.js',
    'large-number.min': './src/index.js'
  },
  output: {
    filename: '[name].js',
    library: 'largeNumber',   // 指定库的全局变量
    libraryTarget: 'umd',     // 支持库引入的方式
    libraryExport: 'default'  // 若不设置，引用库：largeNumber.default
  },
  mode: 'none',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        include: /\.min\.js$/ // 仅对min版本进行压缩
      })
    ]
  }
}
```

**设置入口文件：**
package.json文件的main字段为index.js
```javascript
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/large-number.min.js')
} else {
  module.exports = require('./dist/large-number.js')
}
```


## webpack实现SSR打包

### 服务端渲染（SSR）是什么?
渲染：HTML + CSS + JS + Data => 渲染后的HTML
**服务端渲染的核心是减少请求。**

服务端：
- 所有模板等资源都存储在服务端
- 内网机器拉取数据更快
- 一个HTML返回所有数据

### SSR的优势
- 减少白屏时间
- 对于SEO友好

### SSR代码实现思路
- 服务端
  - 使用react-dom/server的renderToString方法将react组件渲染成字符串；
  - 服务端路由返回对应的模板。
- 客户端
  - **打包出针对服务端的组件（编写组件时，需要将import改为require，将export改为module.exports = `<Comp />`）**
```javascript
if (typeof window === 'undefined') {
  global.window = {}
}

const express = require('express')
const { renderToString } = require('react-dom/server')
const SSR = require('../dist/search-server')

const server = (port) => {
  const app = express()

  app.use(express.static('dist'))

  app.get('/search', (req, res) => {
    const html = renderMarkup(renderToString(SSR))
    res.status(200).send(html)
  })

  app.listen(port, () => {
    console.log('Server is  listening on port: ', port)
  })
}

const renderMarkup = (str) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
  </head>
  <body>
    <div id="root">${str}</div>
  </body>
  </html>
  `
}

server(process.env.PORT || 3000)
```

### webpack ssr打包存在的问题
- **浏览器的全局变量（Node.js中没有document、window）**
  - 组件适配：将不兼容的组件根据打包环境进行适配
  - 请求适配：将fetch或ajax发送请求的写法改成isomorphic-fetch或axios
- **样式问题（Node.js无法解析css）**
  - 方案一：服务端打包通过ignore-loader忽略掉CSS的解析
  - 方案二：将style-loader替换成isomorphic-style-loader

### 如何解决样式不显示的问题?
- 使用打包出来的浏览器端的html作为模板（因为该html上已经引入了css）
- 在html中设置占位符，动态插入server render出来得组件
```javascript
const template = fs.readFileSync(path.join(__dirname, '../dist/search.html'), 'utf-8')
const data = require('./data.json')

const renderMarkup = (str) => {
  const dataStr = JSON.stringify(data)
  return template
    .replace('<!--HTML_PLACEHOLDER-->', str)
    .replace('<!--INITIAL_DATA_PLACEHOLDER-->', `<script>window.__initial_data=${dataStr}</script>`)
}
```

### 首屏数据如何处理?
代码如上👆
- 服务端获取数据
- 替换占位符，将数据挂载到window对象上


## 优化构建时命令行的显示日志

### 统计信息stats
- errors-only：只在发生错误时输出
- minimal：只在发生错误或有新的编译时输出
- none：没有输出
- normal：标准输出
- verbose：全部输出

### 如何优化命令行的构建日志
- **使用friendly-errors-webpack-plugin（success，warning，error）**
- **stats设置成errors-only**（production模式直接在最外层设置，development模式在devServer内设置）


## 构建异常和中断处理

### 如何判断构建是否成功?
在CI/CD的pipeline或者发布系统需要知道当前构建状态。
每次构建完成后，输入`echo $?`获取错误码。

### 如何主动捕获并处理构建错误?
webpack4之前的版本，构建失败不会抛出错误码。
- **compiler在每次构建结束后，都会触发done这个hook**
- process.exit主动处理构建报错
```javascript
module.exports = {
  plugins: [
    function () {
      this.hooks.done.tap('done', (stats) => {
        // 在这里可以做一些上报操作
        if (stats.compilation.errors && stats.compilation.errors.length && process.argv.indexOf('--watch') === -1) {
          console.log('build error')
          process.exit(1)
        }
      })
    }
  ]
}
```
