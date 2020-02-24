---
title: webpack基础篇(2)
date: 2020-02-02
description: Webpack的基础用法，列举常见使用场景。
tags: ['webpack']
layout: blog-post
---

## 文件指纹策略：chunkhash、contenthash和hash
什么是文件指纹？**打包后输出的文件名的后缀**。

文件指纹如何生成？
- hash：和整个项目的构建相关，只有项目文件有修改，整个项目构建的hash值就会更改。(compilation)
- chunkhash：和webpack打包的chunk有关，**不同的entry会生成不同的chunkhash**。
- contenthash：根据文件内容来定义hash，文件内容不变，则contenthash不变。

**注意：chunkhash是无法与热更新一起使用的，所以只在production模式下使用**。

### JS的文件指纹设置
**设置output的filename，使用[chunkhash]**。
```javascript
module.exports = {
  entry: {
    index: './src/index.js',
    search: './src/search.js'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name]_[chunkhash:8].js'
  }
}
```

### CSS的文件指纹设置
**设置MiniCssExtractPlugin的filename，同时使用MiniCssExtractPlugin.loader，使用的是[contenthash]**。
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name]_[contenthash:8].css'
    })
  ]
}
```

### 图片字体的文件指纹设置
**设置file-loader的name，使用[hash]**。
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif|jpeg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name]_[hash:8].[ext]'
            }
          }
        ]
      },
    ]
  }
}
```

占位符及其含义：
- [ext]：资源后缀名
- [name]：文件名称
- [path]：文件的相对路径
- [folder]：文件所在的文件夹
- [contenthash]：文件内容的hash，默认是md5生成
- [hash]：同上
- [emoji]：一个随机的指代文件内容的emoji


## HTML、CSS和JS代码压缩

### JS文件的压缩
**webpack内置了uglifyjs-webpack-plugin，在production模式下默认开启**。

### CSS文件的压缩
**使用optimize-css-assets-webpack-plugin，结合cssnano一起使用**。
```javascript
module.exports = {
  entry: {
    index: './src/index.js',
    search: './src/search.js'
  },
  plugins: [
    new OptimizeCssAssetsWebpackPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: require('cssnano')
    })
  ]
}
```

### HTML文件的压缩
**使用html-webpack-plugin，设置压缩参数**。
```javascript
module.exports = {
  entry: {
    index: './src/index.js',
    search: './src/search.js'
  },
  plugins: [
    new HtmlWebpackPlugin({   // 每个entry对应一个
      template: path.join(__dirname, 'src/index.html'),
      filename: 'index.html',
      chunks: ['index'],    // 依赖的trunk
      inject: true,
      minify: {
        html5: true,
        collapseWhitespace: true,
        preserveLineBreaks: false,
        minifyCSS: true,
        minifyJS: true,
        removeComments: true
      }
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src/search.html'),
      filename: 'search.html',
      chunks: ['search'],
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
  ]
}
```


## 自动清理构建目录产物

### 通过npm scripts清理构建目录
```bash
rm -rf ./dist && webpack
rimraf ./dist && webpack
```

### 自动清理构建目录
**使用clean-webpack-plugin，默认会删除output指定的输出目录**。
```javascript
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  plugins: [
    new CleanWebpackPlugin()
  ]
}
```


## PostCSS插件autoprefixer自动补齐CSS3前缀
CSS3的属性为什么需要前缀？兼容不同浏览器。

**使用autoprefixer插件：**
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'less-loader',
          {
            loader: 'postcss-loader',   // css后处理器
            options: {
              plugins: () => ([
                require('autoprefixer')({
                  browsers: ['last 2 version', '>1%', 'ios 7']
                })
              ])
            }
          }
        ]
      },
    ]
  }
}
```


## 移动端CSS px自动转换成rem
CSS媒体查询实现响应式布局缺点：需要写多套适配样式代码。

rem是什么？font-size of the root element.
- rem是相对单位
- px是绝对单位

将px自动转换成rem：
- **使用px2rem-loader**
- 页面渲染时，计算根元素的font-size值，可以使用手淘的**lib-flexible库**（手动将lib-flexible代码内容内联到html文件的head里面）

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          ...,
          {
            loader: 'px2rem-loader',
            options: {
              remUnit: 75,    // 1rem = 75px
              remPrecision: 8 // 保留8位小数
            }
          }
        ]
      },
    ]
  }
}
```


## 静态资源内联

### 资源内联的意义
- 代码层面
  - 页面框架的初始化脚本（如计算根元素的font-size）
  - 上报相关打点
  - CSS内联避免页面闪动
- 请求层面：减少HTTP网络请求数
  - 小图片或字体内联（url-loader）

### HTML和JS内联
**使用raw-loader：**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- raw-loader 内联 html -->
  ${require('raw-loader!./meta.html')}
  <title>Document</title>
  <!-- raw-loader 内联 JS -->
  <script>
    ${require('raw-loader!babel-loader!../node_modules/lib-flexible/flexible.js')}
  </script>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

### CSS内联
- 方案一：**借助style-loader**
- 方案二：**html-inline-css-webpack-plugin**
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          {
            loader: 'style-loader',
            options: {
              insertAt: 'top',  // 样式插入到<head>
              singleton: true   // 将所有style标签合并成一个
            }
          },
          'css-loader',
          'less-loader',
        ]
      },
    ]
  }
}
```
