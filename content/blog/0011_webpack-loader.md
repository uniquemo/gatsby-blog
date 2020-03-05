---
title: webpack loader
date: 2020-03-03
description: Webpack loader的链式调用，loader的开发与调试等等。
tags: ['webpack']
layout: blog-post
---

## loader的链式调用与执行顺序

### 一个最简单的loader代码结构
定义：**loader只是一个导出为函数的JavaScript模块**。
```javascript
module.exports = function (source) {
  console.log('Loader a is executed!')
  return source
}
```

### 多Loader时的执行顺序
- 多个loader串行执行；
- 顺序从右到左（从后往前）。

### 函数组合的两种情况
- Unix中的Pipeline
- Compose（Webpack采取的这种，所以loader的执行顺序为从右到左）

### 通过一个例子验证loader的执行顺序
Repository: [webpack loader order demo](https://github.com/Unique111/mo-demos/blob/master/webpack-demos/loader-order/package.json)
```javascript
const path = require('path')

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'main.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          path.resolve('./loaders/a-loader.js'),  // 直接引入用于测试的loader
          path.resolve('./loaders/b-loader.js')
        ]
      }
    ]
  }
}
```


## 使用loader-runner高效进行loader的调试

### loader-runner介绍
loader-runner允许你在不安装webpack的情况下运行loaders。详情请看[Loader runner repo](https://github.com/webpack/loader-runner)。

作用：
- 作为webpack的依赖，webpack使用它执行loader；
- 进行loader的开发和调试。

### 举个栗子🌰
Repository: [webpack loader-runner demo](https://github.com/Unique111/mo-demos/blob/master/webpack-demos/raw-loader/package.json)

raw-loader.js：
```javascript
module.exports = function(source) {
  const json = JSON.stringify(source)
    .replace('foo', '')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')

  return `export default ${json}`
}
```

run-loader.js：
```javascript
const fs = require('fs')
const path = require('path')
const { runLoaders } = require('loader-runner')

runLoaders({
  resource: path.join(__dirname, './demo.txt'),
  loaders: [
    path.join(__dirname, './raw-loader.js')
  ],
  context: {
    minimize: true
  },
  readResource: fs.readFile.bind(fs)
}, (err, result) => {
  console.log(err || result)
})
```


## 更复杂的loader的开发场景

### loader的参数获取
通过loader-utils的getOptions方法获取。具体看：[webpack loader-runner demo](https://github.com/Unique111/mo-demos/blob/master/webpack-demos/raw-loader/package.json)
```javascript
const loaderUtils = require('loader-utils')

module.exports = function(source) {
  const { name } = loaderUtils.getOptions(this)
}
```

### loader的异常处理
- loader内直接通过throw抛出
- 通过this.callback传递错误

### loader的异步处理
通过this.async来返回一个异步函数（第一个参数是Error，第二个参数是返回的结果）。
```javascript
module.exports = function(source) {
  const callback = this.async()
  callback(null, source)
}
```

### 在loader中使用缓存
- webpack中默认开启loader缓存，可以通过this.cacheable(false)来关闭缓存；
- 缓存条件：loader的结果在相同的输入下有确定的输出。有依赖的loader无法使用缓存。

### loader如何进行文件输出？
通过this.emitFile进行文件输出。可参考file-loader的代码。


## 实际开发一个loader(TODO)
