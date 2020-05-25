---
title: webpack实战：一个webpack构建包的方方面面
date: 2020-02-05
description: Webpack实战，从头开始写一个webpack构建包，并发布到npm上。
tags: ['webpack']
layout: blog-post
---

## 构建配置包设计

### 构建配置抽离成npm包的意义
- 通用性
  - 业务开发者无需关注构建配置
  - 统一团队构建脚本
- 可维护性
  - 构建配置合理的拆分
  - README文档、ChangeLog文档等
- 质量
  - 冒烟测试、单元测试、测试覆盖率
  - 持续集成

### 构建配置管理的方案
- 通过多个配置文件管理不同环境的构建，webpack --config参数进行控制
- 将构建配置设计成一个库，比如：hjs-webpack、webpack-blocks等
- 抽成一个工具进行管理，比如：create-react-app等
- 将所有的配置放在一个文件，通过--env参数控制分支选择

### 构建配置包设计
- 通过多个配置文件管理不同环境的webpack配置
  - 基础配置：webpack.base.js
  - 开发环境：webpack.dev.js
  - 生产环境：webpack.prod.js
  - SSR环境：webpack.ssr.js
  - ...
- 抽离成一个npm包统一管理
  - 规范：Git commit日志、README、ESLint规范、Semver规范
  - 质量：冒烟测试、单元测试、测试覆盖率和CI
- **通过webpack-merge组合配置**


## 功能模块设计和目录结构
- **基础配置：webpack.base.js**
  - 资源解析：ES6、React、CSS、Less、图片、字体解析
  - 样式增强：CSS前缀补齐、CSS px转换成rem
  - 目录清理
  - 多页面打包
  - 命令行信息显示优化
  - 错误捕获和处理
  - CSS提取成一个单独的文件
- **开发阶段配置：webpack.dev.js**
  - 代码热更新：CSS热更新、JS热更新
  - sourcemap
- **生产阶段配置：webpack.prod.js**
  - 代码压缩
  - 文件指纹
  - Tree Shaking（production下默认开启）
  - Scope Hoisting（production下默认开启）
  - 速度优化：基础包CDN
  - 体积优化：代码分割
- **SSR配置：webpack.ssr.js**
  - output的libraryTarget设置
  - CSS解析ignore


## 使用ESLint规范构建脚本
- 使用eslint-config-airbnb-base
- eslint --fix可以自动处理空格，不断运行该命令检测代码格式问题
```javascript
module.exports = {
  parser: 'babel-eslint',
  extends: 'airbnb-base',
  env: {
    browser: true,
    node: true
  },
  rules: {
    semi: ['error', 'never'],
    'comma-dangle': ['error', 'never']
  }
}
```


## 冒烟测试介绍和实际运用

### 什么是冒烟测试?
冒烟测试是指，对提交测试的软件在进行详细深入的测试之前而进行的预测试，这种预测试的主要目的是暴露导致软件需重新发布的基本功能失效等严重问题。

### 冒烟测试执行
- 构建是否成功
- 每次构建完成后，dist目录是否有内容输出
  - 是否有CSS、JS等静态资源文件
  - 是否有HTML文件

**test/smoke/index.js**
```javascript
const path = require('path')
const webpack = require('webpack')
const rimraf = require('rimraf')
const Mocha = require('mocha')

const mocha = new Mocha({
  timeout: '10000ms'
})

process.chdir(path.join(__dirname, 'template'))

rimraf('./dist', () => {
  const prodConfig = require('../../lib/webpack.prod.js')
  webpack(prodConfig, (err, stats) => {
    if (err) {
      console.error(err)
      process.exit(2)
    }
    console.log(stats.toString({
      colors: true,
      modules: false,
      children: false
    }))

    console.log('\nWebpack build success, begin run test')

    mocha.addFile(path.join(__dirname, 'html-test.js'))
    mocha.addFile(path.join(__dirname, 'css-js-test.js'))
    mocha.run()
  })
})
```

**html-test.js**
```javascript
const glob = require('glob-all')

describe('Checking generated html files', () => {
  it('should generate html files', (done) => {
    const files = glob.sync([
      './dist/index.html',
      './dist/search.html'
    ])

    if (files.length > 0) {
      done()
    } else {
      throw new Error('No html files generated')
    }
  })
})
```


## 单元测试和测试覆盖率
- 单纯的测试框架：mocha、ava，需要断言库
  - 断言库：chai、should.js、expect、better-assert、assert等
- 集成框架，开箱即用：jasmine、jest
- 测试覆盖率：istanbul
```javascript
const assert = require('assert')

describe('webpack.base.js test case', () => {
  const baseConfig = require('../../lib/webpack.base.js')

  it('entry', () => {
    assert.equal(baseConfig.entry.index.indexOf('builder-webpack/test/smoke/template/src/index/index.js') > -1, true)
    assert.equal(baseConfig.entry.search.indexOf('builder-webpack/test/smoke/template/src/search/index.js') > -1, true)
  })
})

```


## 持续集成和TravisCI

### 持续集成的作用
- 快速发现错误
- 防止分支大幅偏离主干

**核心措施是：代码集成到主干之前，必须通过自动化测试。只要有一个测试用例失败，就不能集成。**

### 接入Travis CI
- [https://travis-ci.org/](https://travis-ci.org/)，使用Github账号登录
- 在该地址上为相应项目开启travis ci
- 项目根目录下新增.travis.yml
```yml
language: node_js

sudo: false

cache:
  apt: true
  directories:
    - node_modules

node_js: stable # 设置相应的版本

install:  # 安装项目依赖
  - npm install -D  # 安装构建器依赖
  - cd ./test/smoke/template
  - npm install -D  # 安装模板项目依赖
  - cd ../../../

scripts:
  - npm test
```


## 发布到npm
- **添加用户**：npm adduser
- **升级版本**
  - 升级补丁版本号：npm version patch
  - 升级小版本号：npm version minor
  - 升级大版本号：npm version major
- **发布版本**：npm publish


## Git Commit规范和Changelog生成
### 良好的Git commit规范优势
- 加快Code Review的流程
- 根据Git Commit的元数据生成Changelog
- 后续维护者可以知道Feature被修改的原因

### Commit信息格式要求
```html
<type>(<scope>): <subject>
<BLANK_LINE>
<body>
<BLANK_LINE>
<footer>
```
格式说明：type：某次提交的类型，type的类型如下
- feat：新增feature
- fix：修复bug
- docs：仅仅修改文档，比如README、CHANGELOG、CONTRIBUTE等
- style：仅仅修改了空格、格式缩进等等，不改变代码逻辑
- refactor：代码重构，没有加新功能或修复bug
- perf：优化相关，比如提升性能、体验
- test：测试用例，包括单元测试、集成测试等等
- chore：改变构建流程，或者增加依赖库、工具等
- revert：回滚到上一个版本

### 本地开发阶段增加precommit钩子
- 安装husky：npm i husky -D
- 通过commitmsg钩子校验信息
```json
{
  "scripts": {
    "commitmsg": "validate-commit-msg",
    "changelog": "conventional-changelog -p angular -i CHANGELOG.md -s -r 0"
  }
}
```


## 语义化版本Semantic Versioning规范格式

### 遵循Semver规范的优势
- 避免出现循环依赖
- 依赖冲突减少

### 语义化版本规范格式
- 主版本号：做了不兼容的API修改
- 次版本号：做了向下兼容的功能性新增
- 修订号：做了向下兼容的问题修正

### 先行版本号
先行版本号可以作为发布正式版本之前的版本。
- alpha：内部测试版本，一般不向外发布，会有很多bug，一般只有测试人员用；
- beta：测试版本，这个阶段的版本会一直加入新的功能。在alpha版本之后推出；
- rc：release-candidate，候选版本，rc版本不会再加入新的功能，主要着重于除错。
