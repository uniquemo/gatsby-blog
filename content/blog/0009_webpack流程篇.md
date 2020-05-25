---
title: webpack流程篇
date: 2020-02-10
description: Webpack流程篇，包括准备阶段、模块构建和chunk生成阶段和文件生成阶段等。
tags: ['webpack']
layout: blog-post
---

## 准备阶段
webpack的编译安装下面的钩子调用顺序执行：
- entry-option: 初始化option
- run: 开始编译
- make: 从entry开始递归地分析依赖，对每个依赖模块进行build
- before-resolve: 对模块位置进行解析
- build-module: 开始构建某个模块
- normal-module-loader: 将loader加载完成的module进行编译，生成AST树
- program: 遍历AST，当遇到require等一些调用表达式时，收集依赖
- seal: 所以依赖build完成，开始优化
- emit: 输出到dist目录

## 模块构建和chunk生成阶段

### Compiler hooks
- 流程相关
  - (before-)run
  - (before-/after-)compile
  - make
  - (after-)emit
  - done
- 监听相关
  - watch-run
  - watch-close

### Compilation
Compiler调用Compilation的生命周期方法
- addEntry => addModuleChain
- finish(上报模块错误)
- seal

### ModuleFactory
ModuleFactory分两类：NormalModuleFactory、ContextModuleFactory。

### Module
- NormalModule: 普通模块
  - 使用loader-runner运行loaders
  - 通过Parser解析（内部是acron）
  - ParserPlugins添加依赖
- ContextModule: ./src/a，./src/b
- ExternalModule: module.exports = jQuery
- DelegatedModule: manifest
- MultiModule: entry: ['a', 'b']

### Compilation hooks
- 模块相关
  - build-module
  - failed-module
  - succeed-module
- 优化和seal相关
  - (after-)seal
  - optimize
  - optimize-modules(-basic/advanced)
  - after-optimize-modules
  - after-optimize-chunks
  - after-optimize-tree
  - optimize-chunks-modules(-basic/advanced)
  - after-optimize-chunk-modules
  - optimize-module/chunk-order
  - before-module/chunk-ids
  - (after-)optimize-module/chunk-ids
  - before/after-hash
- 资源生成相关
  - module-assets
  - thunk-assets

### thunk生成算法
1. webpack先将entry中对应的module都生成一个新的thunk；
2. 遍历module的依赖列表，将依赖的module也加入到thunk中；
3. 如果一个依赖module是动态引入的模块，那么就会根据这个module创建一个新的thunk，继续遍历依赖；
4. 重复上面的过程，直至得到所有的thunks。


## 文件生成
seal + emit


## 动手写一个简易的webpack
实现一个简易的webpack：
- 可以将ES6语法转换成ES5的语法
  - 通过babylon生成AST
  - 通过babel-core将AST重新生成源码
- 可以分析模块之间的依赖关系
  - 通过babel-traverse的ImportDeclaration方法获取依赖属性
- 生成的JS文件可以在浏览器中运行

Repository: [mo-pack](https://github.com/uniquemo/mo-pack)
