---
title: webpack源码分析
date: 2020-02-09
description: Webpack源码分析，从webpack的启动过程等分析源码。
tags: ['webpack']
layout: blog-post
---

## webpack启动过程分析

### 查找webpack入口文件
- 在命令行运行命令后，npm会让命令行工具进入`node_modules/.bin`目录查找是否存在webpack.sh或者webpack.cmd文件，如果存在，就执行，不存在，就抛出错误。
- 实际的入口文件是：node_modules/webpack/bin/webpack.js
- webpack最终找到webpack-cli（webpack-command）这个npm包，并且执行CLI。

### 判断某个包是否安装了
```javascript
const isInstalled = packageName => {
  try {
    require.resolve(packageName);
    return true;
  } catch (err) {
    return false;
  }
};
```

### 判断项目使用yarn还是npm
```javascript
const isYarn = fs.existsSync(path.resolve(process.cwd(), "yarn.lock"));
```

### 使用代码来执行命令
```javascript
/**
 * @param {string} command process to run
 * @param {string[]} args commandline arguments
 * @returns {Promise<void>} promise
 */
const runCommand = (command, args) => {
  const cp = require("child_process");
  return new Promise((resolve, reject) => {
    const executedCommand = cp.spawn(command, args, {
      stdio: "inherit",
      shell: true
    });
    executedCommand.on("error", error => {
      reject(error);
    });
    executedCommand.on("exit", code => {
      if (code === 0) {
        resolve();
      } else {
        reject();
      }
    });
  });
};
```


## webpack-cli源码阅读

### webpack-cli做的事情
- 引入yargs，对命令行进行定制；
- 分析命令行参数，对各个参数进行转换，组成编译配置项；
- 引入webpack，根据配置项进行编译和构建。

### 从NON_COMPILATION_CMD分析出不需要编译的命令
webpack-cli处理不需要经过编译的命令。

### NON_COMPILATION_ARGS的内容
webpack-cli提供的不需要编译的命令：
- **init**：创建一份webpack配置文件
- **migrate**：进行webpack版本迁移
- **serve**：运行webpack-serve
- **generate-loader**：生成webpack loader代码
- **generate-plugin**：生成webpack plugin代码
- **info**：返回与本地环境相关的一些信息

### webpack-cli使用args分析
参数分组（config/config-args.js），将命令划分为9类：
- **Config options**：配置相关参数（文件名称、运行环境等）
- **Basic options**：基础参数（entry设置、debug模式设置、watch监听设置、devtool设置）
- **Module options**：模块参数，给loader设置扩展
- **Output options**：输出参数（输出路径、输出文件名称）
- **Advanced options**：高级用法（记录设置、缓存设置、监听频率、bail等）
- **Resolving options**：解析参数（alias和解析的文件后缀设置）
- **Optimizing options**：优化参数
- **Stats options**：统计参数
- **options**：通用参数（帮助命令、版本信息等）

### webpack-cli的执行结果
- **webpack-cli对配置文件和命令行参数进行转换，最终生成配置选项参数options；**
- **最终会根据配置参数实例化webpack对象，然后执行构建流程。**


## Tapable插件架构与Hooks设计

### webpack的本质
可以将webpack理解为**一种基于事件流的编程规范，一系列的插件运行**。

### tapable是什么
Tapable是一个类似于Node.js的EventEmitter的库，**主要是控制钩子函数的发布与订阅，控制着webpack的插件系统**。

Tapable库暴露了很多Hook（钩子）类，为插件提供挂载的钩子。
- **SyncHook**: 同步钩子
- **SyncBailHook**: 同步熔断钩子
- **SyncWaterfallHook**: 同步流水钩子
- **SyncLoopHook**: 同步循环钩子
- **AsyncParallelHook**: 异步并发钩子
- **AsyncParallelBailHook**: 异步并发熔断钩子
- **AsyncSeriesHook**: 异步串行钩子
- **AsyncSeriesBailHook**: 异步串行熔断钩子
- **AsyncSeriesWaterfallHook**: 异步串行流水钩子

### tapable hooks类型
- **Hook**: 所有钩子的后缀
- **Waterfall**: 同步方法，但是它会传值给下一个函数
- **Bail**: 熔断，当函数有任何返回值，就会在当前执行函数停止
- **Loop**: 监听函数返回true表示继续循环，返回undefined表示结束循环
- **Sync**: 同步钩子
- **AsyncSeries**: 异步串行钩子
- **AsyncParallel**: 异步并行执行钩子

### tapable的使用
- new Hook新建钩子
- 钩子的绑定与执行
  - Sync: 绑定tap，执行call
  - Async: 绑定tapAsync/tapPromise/tap，执行callAsync/promise 

```javascript
const { SyncHook, AsyncSeriesHook } = require('tapable')

class Car {
  constructor () {
    // 新建钩子
    this.hooks = {
      accelerate: new SyncHook(['newspeed']),
      brake: new SyncHook(),
      calculateRoutes: new AsyncSeriesHook(['source', 'target', 'routesList'])
    }
  }
}
const myCar = new Car()

// 绑定钩子
myCar.hooks.brake.tap('WarningLampPlugin', () => {
  console.log('WarningLampPlugin')
})
myCar.hooks.accelerate.tap('LoggerPlugin', (newSpeed) => {
  console.log(`Accelerate to ${newSpeed}`)
})
myCar.hooks.calculateRoutes.tapPromise('calculateRoutes tapPromise', (source, target, routesList) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(`tapPromise to ${source} ${target} ${routesList}`)
      resolve()
    }, 1000)
  })
})

// 执行钩子
myCar.hooks.brake.call()
myCar.hooks.accelerate.call(10)
console.time('cost')
myCar.hooks.calculateRoutes.promise('Async', 'hook', 'demo')
  .then(() => {
    console.timeEnd('cost')
  }, err => {
    console.error(err)
    console.timeEnd('cost')
  })
```


## Tapable是如何和Webpack进行关联起来的？

### webpack与tapable关联起来的代码
```javascript
if (Array.isArray(options)) {
  compiler = new MultiCompiler(
    Array.from(options).map(options => webpack(options))
  );
} else if (typeof options === "object") {
  options = new WebpackOptionsDefaulter().process(options);

  compiler = new Compiler(options.context);
  compiler.options = options;
  new NodeEnvironmentPlugin({
    infrastructureLogging: options.infrastructureLogging
  }).apply(compiler);
  if (options.plugins && Array.isArray(options.plugins)) {
    for (const plugin of options.plugins) {
      if (typeof plugin === "function") {
        plugin.call(compiler, compiler);
      } else {
        plugin.apply(compiler);
      }
    }
  }
  compiler.hooks.environment.call();
  compiler.hooks.afterEnvironment.call();
  compiler.options = new WebpackOptionsApply().process(options, compiler);
} else {
  throw new Error("Invalid argument: options");
}
```

### 模拟webpack插件的定义与执行
**compiler.js**
```javascript
const { SyncHook, AsyncSeriesHook } = require('tapable')

module.exports = class Car {
  constructor () {
    // 新建钩子
    this.hooks = {
      accelerate: new SyncHook(['newspeed']),
      brake: new SyncHook(),
      calculateRoutes: new AsyncSeriesHook(['source', 'target', 'routesList'])
    }
  }
  run () {
    this.accelerate(10)
    this.break()
    this.calculateRoutes('Async', 'hook', 'demo')
  }
  break () {
    this.hooks.brake.call()
  }
  accelerate (speed) {
    this.hooks.accelerate.call(10)
  }
  calculateRoutes (...args) {
    this.hooks.calculateRoutes.promise(...args)
      .then(() => {
        console.log(...args)
      }, err => {
        console.error(err)
      })
  }
}
```

**插件代码my-plugin.js**
```javascript
const Compiler = require('./compiler')

// 插件定义
class MyPlugin {
  apply (compiler) {
    compiler.hooks.brake.tap('WarningLampPlugin', () => {
      console.log('WarningLampPlugin')
    })
    compiler.hooks.accelerate.tap('LoggerPlugin', (newSpeed) => {
      console.log(`Accelerate to ${newSpeed}`)
    })
    compiler.hooks.calculateRoutes.tapPromise('calculateRoutes tapPromise', (source, target, routesList) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          console.log(`tapPromise to ${source} ${target} ${routesList}`)
          resolve()
        }, 1000)
      })
    })
  }
}

// 模拟插件执行，这块代码是在webpack内，此处为了方便
const myPlugin = new MyPlugin()
const options = {
  plugins: [myPlugin]
}
const compiler = new Compiler()
for (const plugin of options.plugins) {
  if (typeof plugin === 'function') {
    plugin.call(compiler, compiler)
  } else {
    plugin.apply(compiler)
  }
}
compiler.run()
```

参考链接：
- [深入源码解析 tapable 实现原理](https://juejin.im/post/5dc16519f265da4cf1583eb2)
