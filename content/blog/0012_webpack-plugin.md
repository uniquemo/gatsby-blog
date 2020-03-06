---
title: webpack plugin
date: 2020-03-06
description: Webpack plugin的基础结构等等。
tags: ['webpack']
layout: blog-post
---

## 插件基本结构介绍

### 插件的运行环境
- 插件没有像loader那样的独立运行环境
- 插件只能在webpack里运行

### 插件的基本结构
```javascript
module.exports = class MyPlugin { // 插件名称
  apply(compiler) { // 插件上的apply方法
    compiler.hooks.done.tap('My Plugin', (stats) => { // 插件的hooks
      console.log('Hello world')  // 插件的处理逻辑
    })
  }
}

// 插件使用
module.exports = {
  plugins: [new MyPlugin()]
}
```

### 搭建插件的运行环境
- 安装webpack、webpack-cli
- 创建webpack.config.js文件
- 在config文件中添加该插件


## 更复杂的插件开发场景

### 插件中如何获取传递的参数
**通过插件的构造函数获取。**
```javascript
module.exports = class MyPlugin {
  constructor(options) {
    this.options = options
  }
  apply(compiler) {
    console.log(this.options)
  }
}
```

### 插件的错误处理

#### 参数校验阶段可以直接通过throw的方式抛出
```javascript
throw new Error('Error Message')
```

#### 若进入hook阶段，通过compilation对象的warnings和errors接收
```javascript
compilation.warnings.push('warning')
compilation.errors.push('error')
```

### 通过Compilation进行文件写入
- **Compilation上的assets可以用于文件写入。**
- 文件写入需要使用webpack-sources包。
```javascript
const { RawSource } = require('webpack-sources')
module.exports = class DemoPlugin {
  constructor(options) {
    this.options = options
  }
  apply(compiler) {
    const { name } = this.options
    compiler.hooks.emit.tap('Demo Plugin', (compilation, cb) => {
      compilation.assets[name] = new RawSource('demo')
      cb()
    })
  }
}
```

### 插件扩展——编写插件的插件
**插件自身也可以通过暴露hooks的方式进行自身扩展。**

比如html-webpack-plugin：
- html-webpack-plugin-alter-chunks(Sync)
- html-webpack-plugin-before-html-generation(Async)
- html-webpack-plugin-alter-asset-tags(Async)
- html-webpack-plugin-after-html-processing(Async)
- html-webpack-plugin-after-emit(Async)


## 实战开发一个压缩构建资源为zip包的插件
要求：
- 生成的zip包文件名称可通过插件传入；
- 需要使用compiler对象上特定的hooks进行资源的生成。

准备知识：
- 使用**jszip包**将文件压缩为zip包；
- Compiler上负责文件生成的hooks：**emit**，一个异步的hook；
- Emit生成文件阶段，读取的是**compilation.assets**对象的值，所以需要将要生成的文件添加到该对象上。

详细代码看：[webpack zip-plugin demo](https://github.com/Unique111/mo-demos/blob/master/webpack-demos/zip-plugin/package.json)
