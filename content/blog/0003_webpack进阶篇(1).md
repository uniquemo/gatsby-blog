---
title: webpack进阶篇(1)
date: 2020-02-03
description: Webpack的进阶用法，列举常见使用场景。
tags: ['webpack']
layout: blog-post
---

## treeshaking的使用和原理分析
tree shaking：摇树优化，借鉴于rollup。

### treeshaking概念与使用

- 概念：一个模块可能有多个方法，只有其中某个方法使用到了，整个文件就会被打包到bundle中，**tree shaking就是只把用到的方法打包到bundle里面去，没用到的方法会在uglify阶段被擦除掉**。
- 使用：webpack默认支持，在.babelrc里设置modules:false即可。**production模式下默认开启**。
- **要求：必须是ES6的语法，CJS的方式不支持**。

**DCE：Dead code elimination。**
- 代码不会被执行，不可到达
- 代码执行的结果不会被用到
- 代码只会影响死变量（只写不读）

### treeshaking原理
**利用ES6模块的特点：**
- 只能作为模块顶层的语句出现
- import的模块名只能是字符串常量
- import binding是immutable的

代码擦除：标记无用代码，在uglify阶段删除无用代码。


## 多页面应用打包通用解决方案
多页面打包基本思路：**每个页面对应一个entry，一个html-webpack-plugin**。
缺点：每次新增或删除页面需要修改webpack配置。

通用方案：
- 动态获取entry和设置html-webpack-plugin数量
- 利用glob.sync
```javascript
const setMPA = () => {
  const entry = {}
  const htmlWebpackPlugins = []

  const entryFiles = glob.sync(path.join(__dirname, './src/*/index.js'))

  Object.keys(entryFiles)
    .map((index) => {
      const entryFile = entryFiles[index]
      const match = entryFile.match(/src\/(.*)\/index\.js/)
      const pageName = match && match[1]

      entry[pageName] = entryFile
      htmlWebpackPlugins.push(
        new HtmlWebpackPlugin({
          template: path.join(__dirname, `src/${pageName}/index.html`),
          filename: `${pageName}.html`,
          chunks: [pageName],
          inject: true,
          minify: {
            html5: true,
            collapseWhitespace: true,
            preserveLineBreaks: false,
            minifyCSS: true,
            minifyJS: true,
            removeComments: true
          }
        })
      )
    })

  return {
    entry,
    htmlWebpackPlugins
  }
}
const { entry, htmlWebpackPlugins } = setMPA()

module.exports = {
  entry,
  plugins: [
    ...
  ].concat(htmlWebpackPlugins)
}
```


## 使用source map
作用：通过source map定位到源码。

**开发环境开启，线上环境关闭。线上排查问题的时候可以将sourcemap上传到错误监控系统**。

### source map关键字
- eval：使用eval包裹模块代码
- source map：产生.map文件
- cheap：不包含列信息
- inline：将.map作为DataURI嵌入，不单独生成.map文件
- module：包含loader的sourcemap
```javascript
module.exports = {
  mode: 'development',
  devtool: 'source-map'
}
```


## ScopeHoisting使用和原理分析

### 为什么需要scope hoisting?
构建后的代码存在大量闭包代码。

这样会导致：
- 大量函数闭包包裹代码，导致**体积增大**（模块越多越明显）
- 运行代码时，创建的函数作用域变多，**内存开销变大**

### 模块转换分析
- 被webpack转换后的模块会带上一层包裹
- import会被转换成`__webpack_require__`

### webpack的模块机制
- **打包出来的是一个IIFE（匿名闭包）**
- modules是一个数组，**每一项是一个模块初始化函数**
- **`__webpack_require__`用来加载模块，返回module.exports**
- 通过**WEBPACK_REQUIRE_METHOD(0)**启动程序

### scope hoisting原理
- **原理：将所有模块的代码按照引用顺序，放在一个函数作用域里，然后适当地重命名一些变量以防止变量名冲突**。
- 对比：通过scope hoisting可以减少函数声明代码和内存开销。

### scope hoisting使用
- **webpack mode为production时默认开启**
- **必须是ES6语法，CJS不支持**

如果需要看效果，可以将mode设置为none，同时启动ModuleConcatenationPlugin。
```javascript
module.exports = {
  mode: 'none',
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin()
  ]
}
```


## 提取页面公共资源

### 基础库分离
- 思路：将react、react-dom基础包通过cdn引入，不打包进bundle中。
- 方法：使用html-webpack-externals-plugin

webpack配置：
```javascript
const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin')

module.exports = {
  plugins: [
    new HtmlWebpackExternalsPlugin({
      externals: [
        {
          module: 'react',
          entry: 'https://unpkg.com/react@16/umd/react.production.min.js',
          global: 'React'
        },
        {
          module: 'react-dom',
          entry: 'https://unpkg.com/react-dom@16/umd/react-dom.production.min.js',
          global: 'ReactDOM'
        }
      ]
    })
  ]
}
```

index.html模板文件中引入对应的模块：
```html
<script src="https://unpkg.com/react@16/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@16/umd/react-dom.production.min.js"></script>
```

### 利用SplitChunksPlugin进行公共脚本分离
- webpack4内置的，用来替代CommonsChunkPlugin插件。
- chunks参数说明：
  - async：对异步引入的库进行分析和提取（默认）
  - initial：对同步引入的库进行分析和提取
  - all：对所有引入的库进行分析和提取

### 利用SplitChunksPlugin分离基础包
- test：匹配出需要分离的包
- **注意：包分离出来以后，需要添加进`HtmlWebpackPlugin的chunks字段`中**。
```javascript
module.exports = {
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /(react|react-dom)/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }
}
```

### 利用SplitChunksPlugin分离页面公共文件
- minChunks：设置最少引用次数
- minSize：分离的包体积的大小
```javascript
module.exports = {
  optimization: {
    splitChunks: {
      minSize: 0,   // 这个thunk最小的大小，单位byte
      cacheGroups: {
        commons: {
          name: 'commons',  // 记住：分离出来的chunk需要添加进HtmlWebpackPlugin的chunks字段
          chunks: 'all',
          minChunks: 2  // 这个模块至少被引用的次数
        }
      }
    }
  }
}
```


## 代码分割和动态import

### 代码分割的意义
- 当某些代码块是在某些特殊时候才用到，若把所有代码都放在同一个文件，是低效的。
- webpack有一个功能就是将你的代码库分割成chunks（语块），当代码运行需要它们时，再进行加载。

适用场景：
- **抽离相同代码到一个共享块；**
- **脚本懒加载，使得初始加载的代码更小。**

### 懒加载JS脚本的方式
- CommonJS：require.ensure
- ES6：动态import（目前还没有原生支持，需要babel转换）

### 如何动态import?
1. 安装babel插件：@babel/plugin-syntax-dynamic-plugin
2. ES6：动态import（目前还没有原生支持，需要babel转换）
```javascript
{
  "presets": [
    "@babel/preset-env",
    "@babel/preset-react"
  ],
  "plugins": [
    "@babel/plugin-syntax-dynamic-import"
  ]
}
```

定义一个组件text.js：
```javascript
import React from 'react'
export default () => <div>动态Import</div>
```

异步加载组件：
```javascript
import('./text.js').then((Text) => {
  this.setState({ Text: Text.default })
})
```

打包后会发现，会多出一个chunk `2_6ef8dd24.js`（我的情况）。
