---
title: 从头开始搭建React+TypeScript+Eslint+Babel+Webpack项目
date: 2020-04-22
description: 记录搭建React、TypeScript、Babel、Eslint、Webpack项目过程中遇到的问题。
tags: ['工程化']
layout: blog-post
---

## 项目配置
### Babel配置
#### 如何在代码中使用async/await
参考文章：
- [Babel 7 - ReferenceError: regeneratorRuntime is not defined](https://stackoverflow.com/questions/53558916/babel-7-referenceerror-regeneratorruntime-is-not-defined)
- [regeneratorRuntime is not defined](https://github.com/babel/babel/issues/8829)

解决：安装`@babel/plugin-transform-runtime`，并添加到.babelrc配置文件中。

#### TODO: babel-eslint报错(Parsing error)，但是tsc并没有错
参考文章：
- [vscode安装使用ESLint，typescript](https://www.cnblogs.com/Jamie1032797633/p/11125786.html)
- [How To Set Up ESLint, TypeScript, Prettier with Create React App](https://dev.to/benweiser/how-to-set-up-eslint-typescript-prettier-with-create-react-app-3675)

### Eslint配置
#### 在VSCode中，格式出错ESlint没有报错？
- 检查下是否在VSCode中安装了eslint插件；
- 需要在VSCode中，添加如下eslint的配置。
```json
{
  "eslint.validate": [
    "javascript",
    "typescript",
    "javascriptreact",
    "typescriptreact"
  ]
}
```

#### 如何强制使用单引号？
```json
{
  "rules": {
    "quotes": ["error", "single"]
  }
}
```

### TypeScript配置
这里只让TS做类型检查，不使用ts-loader来转换代码。需要开启`noEmit: true`的配置。

#### 在文件中通过import引入css文件时，TS报错找不到模块
- 原因：TS会特殊对待`import`。具体参考文章：[How to use CSS Modules with TypeScript and webpack](https://medium.com/@sapegin/css-modules-with-typescript-and-webpack-6b221ebe5f10)。
- 解决方法：使用`typings-for-css-modules-loader`，它会为css文件生成`typings`。
- 然而，还是报错，这次报的是找不到`css-loader/locals`，参考文章：[找不到css-loader/locals](https://github.com/Jimdo/typings-for-css-modules-loader/issues/95)。
- 解决方法：使用另外一个loader[@teamsupercell/typings-for-css-modules-loader](https://github.com/TeamSupercell/typings-for-css-modules-loader)，该loader是从`typings-for-css-modules-loader`fork过来的。

还可以直接声明一个css模块：
```javascript
declare module '*.css' {
  const content: any
  export default content
}
```

#### 'this' implicitly has type 'any' because it does not have a type annotation.
把tsconfig.json中的`noImplicitThis: false`。

#### Indexing objects in TypeScript
参考：
- [Indexing objects in TypeScript](https://dev.to/kingdaro/indexing-objects-in-typescript-1cgi)
- [keyof用法](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-1.html#keyof-and-lookup-types)

解决：使用keyof。
```javascript
interface IColumn<RecordType> {
  title?: string,
  key: keyof RecordType
}
```

### Webpack配置
#### 如何在webpack中直接使用import等ES6语法？
参考stackoverflow: [How can I use ES6 in webpack.config.js?](https://stackoverflow.com/questions/31903692/how-can-i-use-es6-in-webpack-config-js)
- 将config文件重命名为`webpack.config.babel.js`；
- 安装@babel/register包；
- 执行即可。

**@babel/register(babel-register同理)的作用：**
- babel-register模块改写require命令，为它加上一个钩子。此后，每当使用require加载.js、.jsx、.es和.es6后缀名的文件，就会先用Babel进行转码。
- 使用时，必须首先加载babel-register，然后，就不需要手动对index.js转码了。
- 需要注意的是，babel-register只会对require命令加载的文件转码，而不会对当前文件转码。另外，由于它是实时转码，所以只适合在开发环境使用。

#### Webpack中file-loader和url-loader的区别
- url-loader封装了file-loader。url-loader不依赖于file-loader，即使用url-loader时，只需要安装url-loader即可，不需要安装file-loader，因为url-loader内置了file-loader。
- url-loader工作分两种情况：
  1. 文件大小小于limit参数，url-loader将会把文件转为DataURL；
  2. 文件大小大于limit，url-loader会调用file-loader进行处理，参数也会直接传给file-loader。因此我们只需要安装url-loader即可。

#### 如何配置简便的模块引入路径？
```javascript
module.exports = {
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
    modules: [path.resolve(__dirname, 'src'), 'node_modules']
  }
}
```
- 配置以后，引入模块时可以更方便，例如`import Layout from 'components/Layout'`。
- 但是存在个问题，TS会报错`找不到components/Layout`。此时，需要配置一下tsconfig.json，`baseUrl: 'src'`。

#### 如何在代码文件中通过判断环境来切换不同逻辑？
- webpack内置了一个默认的环境变量`process.env.NODE_ENV`，可以直接使用。
- 另外，也可以通过[EnvironmentPlugin](https://webpack.js.org/plugins/environment-plugin/)或者[DefinePlugin](https://webpack.js.org/plugins/define-plugin/)来自定义变量。

#### 切换路由刷新页面时404
解决：
- 在devServer配置中添加`historyApiFallback: true`。
- 在output中添加`publicPath: '/'`。

#### mini-css-extract-plugin插件编译时出现warning
- 参考github issue：[mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin/issues/250#issuecomment-415345126)
- 原因：css文件引入顺序不一致，有时候a.css在b.css之前，有时候又反过来；
- 解决：调整相应文件的引入顺序。（比如很多地方都用到的Pagination组件等）。


## CSS如何处理？
### 使用CSS Modules
使用CSS Modules，参考：[CSS Modules](http://www.ruanyifeng.com/blog/2016/06/css_modules.html)

- [CSS Modules 详解及 React 中实践](https://github.com/camsong/blog/issues/5)
- [React样式管理](https://juejin.im/post/5cdad9c7f265da039b08915d)

### CSS Modules怎么配置才能写嵌套样式？
参考文章：[PostCSS学习总结](https://www.ruphi.cn/archives/275/#anchor0)
- 在webpack配置中添加postcss-loader；(安装`postcss-loader、postcss-nested`)
- 在根目录添加postcss.config.js：
```javascript
module.exports = {
  // parser: 'sugarss',   // 若使用sugarss解析器，会报错说不能使用大括号，所以这里注释掉
  plugins: {
    'postcss-nested': {}  // 引入可以嵌套写css的插件
  }
}
```

### 引入blueprints组件库
样式不生效，样式也被转换为hash了。

参考：[CSS Modules: How do I disable local scope for a file?](https://stackoverflow.com/questions/35398733/css-modules-how-do-i-disable-local-scope-for-a-file)

解决方案：针对node_modules下的css文件以及自定义的css文件，分别配置webpack的css的处理器。
```javascript
const config = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        include: /node_modules/   // 仅针对node_modules下的*.css文件
      },
      {
        test: /\.module\.css$/,   // 自定义的css，文件命名为*.module.css
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              import: true,
              modules: {
                localIdentName: '[path][name]__[local]--[hash:base64:5]'
              }
            }
          }
        ],
        include: /src/      // 仅针对src目录下的*.module.css文件
      }
    ]
  }
}
```

- 一开始，按照上面👆的方式配置调试了很久，blueprints的样式始终被转换为了hash...
- 后来，终于发现，loader是针对`import`关键字来对符合`test`正则的文件进行处理的，然而我引入blueprints时，是通过新建一个global.module.css文件，然后在该css文件里面引入blueprints相关的css文件，导致样式被第二个css处理器配置所处理。
- 解决方案：直接在js文件中通过`import`关键字引入css文件。而不要使用下面的引入方式：（**官网惹的祸！！！**）

```javascript
/* 正确的引入方式： */
import 'normalize.css/normalize.css'
import '@blueprintjs/icons/lib/css/blueprint-icons.css'
import '@blueprintjs/core/lib/css/blueprint.css'

/* 错误的引入方式：在global.module.css中， */
@import "~normalize.css";
@import "~@blueprintjs/core/lib/css/blueprint.css";
@import "~@blueprintjs/icons/lib/css/blueprint-icons.css";
```


## React Hooks数据流管理
参考文章：[React Hooks数据流](https://github.com/dt-fe/weekly/blob/v2/146.%E7%B2%BE%E8%AF%BB%E3%80%8AReact%20Hooks%20%E6%95%B0%E6%8D%AE%E6%B5%81%E3%80%8B.md)
### 单组件数据流
使用useState。

### 组件间共享数据流
- 使用useContext；
- 问题：数据与UI耦合。

### 数据流与组件解耦
- 使用unstated-next，可以把定义在组件中的数据单独出来，形成一个自定义数据管理Hook；
- 问题：性能低下，useState无法合并更新。

### 合并更新
- useReducer可以让数据合并更新；所以使用`unstated-next结合useReducer`；
- 问题：仍存在性能问题，某个状态更新，会引发整体更新；这是因为unstated-next中的useContainer提供的数据流是一个引用整体，其某个子节点引用变化后会导致整个Hook重新执行，继而所有引用它的组件都会重新渲染。

### 按需更新
- 使用Redux useSelector实现按需更新；
- 但useSelector的作用仅仅是计算结果不变化时阻止组件刷新，但并不能保证返回结果的引用不变化。

### 防止数据引用频繁变化
使用useSelector、deepEqual、useDeepMemo。

### 缓存查询函数
使用reselect的createSelector。


## 遇到的CSS问题
### 宽度不确定，让高度等于宽度
参考：[How TO - Aspect Ratio](https://www.w3schools.com/howto/howto_css_aspect_ratio.asp)
```css
.item {
  width: 100%;
  padding-top: 100%;  /* padding是相对于width来计算的 */
}
```

### 隐藏scroll bar
参考：[Hide scroll bar, but while still being able to scroll](https://stackoverflow.com/questions/16670931/hide-scroll-bar-but-while-still-being-able-to-scroll)


## React问题
### Synthetic Events in setState()
参考：
- [Fixing React Warning: Synthetic Events in setState()](https://duncanleung.com/fixing-react-warning-synthetic-events-in-setstate/)
- [setState的一个Synthetic Event Warning](https://segmentfault.com/a/1190000012181781)

SyntheticEvent对象是通过合并得到的。这意味着在事件回调被调用后，SyntheticEvent对象将被重用并且所有属性都将被取消。这是出于性能原因。因此，您无法以异步方式访问该事件。


## 项目性能优化
- 移除style-loader，引入MiniCssExtractPlugin；
- 移除@blueprintjs/icons/lib/css/blueprint-icons.css；
- Prod：压缩CSS；
- 开启optimization；
- lazy import；
- 使用babel-import-loader，移除没有使用的@blueprintjs/core组件；
- playList、playHistory不存储在state中；
- 使用requestAnimation；
- 可以不显示在可视区域里的内容，尽量不显示


## Audio
音视频接口：https://www.w3school.com.cn/html5/html5_ref_audio_video_dom.asp
