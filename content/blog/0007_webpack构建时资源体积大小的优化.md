---
title: webpack构建时资源体积大小的优化
date: 2020-02-08
description: Webpack构建时，资源体积大小的优化，包括图片大小优化、CSS优化等等。
tags: ['webpack']
layout: blog-post
---

## 使用webpack进行图片压缩
要求：基于Node库的imagemin或者tinypng API。
使用：配置image-webpack-loader。

imagemin的优点：
- 有很多定制选项；
- 可以引入更多第三方优化插件，比如pngquant；
- 可以处理多种图片格式。

遇到的问题及解决：
- 添加image-webpack-loader配置后报错：[module build failed](https://github.com/tcoopman/image-webpack-loader/issues/104)
- 解决：执行`npm rebuild`后，重新build。

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
          },
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                progressive: true,
                quality: 65
              },
              // optipng.enabled: false will disable optipng
              optipng: {
                enabled: false,
              },
              pngquant: {
                quality: [0.65, 0.90],
                speed: 4
              },
              gifsicle: {
                interlaced: false,
              },
              // the webp option will enable WEBP
              webp: {
                quality: 75
              }
            }
          },
        ]
      },
    ]
  }
}
```


## 使用TreeShaking擦除无用的CSS
- 使用purgecss-webpack-plugin
- 和mini-css-extract-plugin配合使用

**失败了：原因？TODO**
```javascript
const PurgecssPlugin = require('purgecss-webpack-plugin')
const PATHS = {
  src: path.join(__dirname, 'src')
}
module.exports = {
  plugins: [
    new PurgecssPlugin({
      paths: glob.sync(`${PATHS.src}/**/*`,  { nodir: true }),
    }),
  ]
}
```


## 使用动态Polyfill服务
使用polyfill service，原理——**识别User Agent，下发不同的Polyfill**。

polyfill.io官方提供的服务：
```html
<script src="https://polyfill.io/v3/polyfill.min.js"></script>
```
可以基于官方自建polyfill服务。


## 总结：体积优化的策略

### Scope Hoisting
### Tree shaking
### 公共资源分离
### 图片压缩
### 动态Polyfill
