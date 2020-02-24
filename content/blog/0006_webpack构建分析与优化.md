---
title: webpack构建分析与优化
date: 2020-02-06
description: Webpack构建优化，包括构建速度、bundle体积等的优化。
tags: ['webpack']
layout: blog-post
---

## 初级分析：使用webpack内置的stats
**stats：构建的统计信息。**
```json
{
  "scripts": {
    "build:stats": "webpack --config webpack.prod.js --json > stats.json"
  }
}
```

在Node.js中使用：
```javascript
const webpack = require('webpack')
const config = require('./webpack.config.js')('production')

webpack(config, (err, stats) => {
  console.log(stats)
})
```


## 速度分析：使用speed-measure-webpack-plugin
- 使用这个插件，分析整个打包总耗时；
- **可以看到每个loader和插件的执行耗时**。
```javascript
const SpeedMeasureWebpackPlugin = require('speed-measure-webpack-plugin')
const smp = new SpeedMeasureWebpackPlugin()
module.exports = smp.wrap({
  plugins: [
    ...
  ]
})
```


## 体积分析：使用webpack-bundle-analyzer
使用这个插件，构建完成后会在8888端口展示大小。
可以分析如下问题：
- 依赖的第三方模块文件的大小
- 业务里面的组件代码大小
```javascript
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
module.exports = {
  plugins: [
    new BundleAnalyzerPlugin()
  ]
}
```


## 使用高版本的webpack和Node
- 降低构建时间

使用webpack4可以优化的原因：
- V8带来的优化（for of替代forEach、Map和Set替代Object、includes替代indexOf）
- 默认使用更快的md4 hash算法
- webpack AST可以直接从loader传递给AST，减少解析时间
- 使用字符串方法替代正则表达式


## 多进程多实例构建
多进程/多实例构建：资源并行解析可选方案
- thread-loader（官方提供）
- Happypack（作者不再维护）
- parallel-webpack

### 使用Happypack解析资源
原理：每次webpack解析一个模块，Happypack会将它及它的依赖分配给worker线程。(Happypack会创建一个线程池)
```javascript
const Happypack = require('happypack')
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          'happypack/loader'
        ]
      },
    ]
  },
  plugins: [
    new Happypack({
      loaders: ['babel-loader']
    })
  ]
}
```

### 使用thread-loader解析资源
原理：每次webpack解析一个模块，thread-loader会将它及它的依赖分配给worker线程。
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'thread-loader',
            options: {
              workers: 3
            }
          },
          'babel-loader'
        ]
      }
    ]
  }
}
```


## 多进程多实例并行压缩
- 方法一：使用parallel-uglify-plugin插件
- 方法二：使用uglifyjs-webpack-plugin插件，并开启parallel参数
- 方法三：使用terser-webpack-plugin插件，并开启parallel参数（webpack4推荐使用）
```javascript
const TerserWebpackPlugin = require('terser-webpack-plugin')
module.exports = {
  optimization: {
    minimizer: [
      new TerserWebpackPlugin({
        parallel: 4 // worker的数量，若值为true，则默认是CPU核数 * 2 - 1
      })
    ]
  }
}
```


## 进一步分包：预编译资源模块

### 分包：设置Externals
- 思路：将react、react-dom基础包通过CDN引入，不打入bundle中
- 方法：使用html-webpack-externals-plugin
- 缺点：一个基础库对应一个CDN

具体参考：`webpack进阶篇(1)——提取页面公共资源`部分。

### 分包：使用splitChunks
- 缺点：虽然分离出了基础包，但它仍然会对基础包进行分析

### 进一步分包：预编译资源模块
- 思路：将react、react-dom、redux、react-redux基础包和业务基础包，打包成一个文件
- 方法：使用DLLPlugin进行分包，DllReferencePlugin对manifest.json进行引用

具体步骤：
- 首先我们要先用webpack去导入webpack.dll.js中的配置，然后根据配置生成动态链接库文件，生成的文件是单独的js文件。
- 然后我们在webpack.config.js配置文件中使用DllReferencePlugin去引入这些第一步生成的动态链接库文件，**并且告知webpack不要再去编译这些文件**。
- 最后，在index.html里手动添加相应的script标签，引用生成的动态链接库文件。
- **TODO：将生成的动态链接库文件自动插入到html文件中（使用add-asset-html-webpack-plugin？）**。

**webpack.dll.js**
```javascript
const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: {
    library: [
      'react',
      'react-dom'
    ]
  },
  output: {
    filename: '[name].dll.js',
    path: path.join(__dirname, 'build/library'),
    // 存放动态链接库的全局变量名称，例如对应 library 来说就是 library_dll
    library: '[name]_dll'   // 暴露出来的库的名字，需要与下面DllPlugin的name值保持一致
  },
  plugins: [
    new webpack.DllPlugin({
      context: __dirname, // 必填，不然在web网页中找不到 '[name]_dll'，会报错
      // 动态链接库的全局变量名称，需要和 output.library 中保持一致
      // 该字段的值也就是输出的 manifest.json 文件 中 name 字段的值
      name: '[name]_dll',
      // 描述动态链接库的 manifest.json 文件输出时的文件名称
      path: path.join(__dirname, 'build/library/[name].json')
    })
  ]
}
```

**webpack.prod.js 引用上面👆生成的manifest.json文件**
```javascript
module.exports = {
  plugins: [
    new webpack.DllReferencePlugin({  // 加入插件，让webpack使用dll
      manifest: require('./build/library/library.json')
    })
  ]
}
```


## 充分利用缓存提升二次构建速度
目的：提升二次构建速度。开启缓存后，可以看到`node_modules/.cache`下会有对应缓存内容。

缓存思路：
- babel-loader开启缓存
- terser-webpack-plugin开启缓存
- 使用cache-loader或者hard-source-webpack-plugin

### babel-loader开启缓存
```javascript
module.exports = {
  plugins: [
    new Happypack({
      loaders: ['babel-loader?cacheDirectory=true']
    }),
  ]
}
```

### terser-webpack-plugin开启缓存
```javascript
module.exports = {
  optimization: {
    minimizer: [
      new TerserWebpackPlugin({
        parallel: 4,
        cache: true
      })
    ]
  },
}
```

### 使用hard-source-webpack-plugin
```javascript
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')
module.exports = {
  plugins: [
    new HardSourceWebpackPlugin()
  ]
}
```


## 缩小构建目标
目的：尽可能少地构建模块。比如babel-loader不解析node_modules。

减少文件搜索范围：
- 优化`resolve.modules`配置（减少模块搜索层级）
- 优化`resolve.mainFields`配置
- 优化`resolve.extensions`配置
- 合理使用`alias`

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve('src'),
        // ...
      }
    ]
  },
  // ...
  resolve: {
    alias: {
      'react': path.resolve(__dirname, './node_modules/react/umd/react.production.min.js'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom/umd/react-dom.production.min.js')
    },
    modules: [path.resolve(__dirname, 'node_modules')],
    extensions: ['.js'],
    mainFields: ['main']
  }
}
```
