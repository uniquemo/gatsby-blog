---
title: Node.js概览
date: 2020-03-25
description: Nodejs基础，包括事件循环、非阻塞I/O等特性，性能调优，框架与工程化等。
tags: ['Node.js']
layout: blog-post
---

## Node.js内置模块
- Node.js调用操作系统；
- 操作系统通知Node.js。

### EventEmitter
观察者模式：
- 关键在于`“不知道被通知者存在”`；
- 以及`“没有人听还能继续下去”`。


## 异步操作
### 异步：非阻塞I/O
- I/O即Input/Output，一个系统的输入和输出。
- 阻塞I/O和非阻塞I/O的区别：系统接收输入再到输出期间，能不能接收其他输入。

### 异步：异步编程之callback
回调函数的格式规范：error-first callback。
- 异步流程控制(异步并发控制等)
- npm：async.js
- thunk

### 异步：事件循环

### 异步：异步编程之Promise
- 当前事件循环得不到的结果，但未来的事件循环会给到你结果。
- Promise是一个状态机。pending，fulfilled/resolved，rejected。

### 异步：异步编程之async-await
- async是Promise的语法糖封装。
- 以同步的方式写异步。


## HTTP
- http内置模块。
- express核心功能：路由、简化http、提供模板引擎、脚手架。
- koa核心功能：
  - **中间件：使用async实现中间件，在异步的情况下也符合洋葱模型。**
  - Context/Request/Response。

### RPC
Remote Procedure Call：远程过程调用。

#### 和Ajax有什么共同点？
- 都是两个计算机之间的网络通信；
- 需要双方约定一个数据格式。

#### 和Ajax有什么不同点？
- 不一定使用DNS作为寻址服务；RPC一般是内网服务互相请求，通过ID在寻址服务器上获取到IP。
- 应用层协议一般不使用HTTP；RPC一般使用`二进制协议`，更小的数据包体积，更快的编解码速率。
- 基于TCP或UDP协议。

#### Node.js内置net建立多路复用的RPC通道
- 关键在于应用层协议需要有标记`包号`的字段；
- 处理一下情况，需要有标记`包长`的字段；
  - 粘包
  - 不完整包
- 错误处理


## 性能调优
### HTTP服务性能测试
- 想要优化性能，首先要做性能检查。
- 压力测试工具
  - ab：`ab -c200 -n1600 http://127.0.0.1:3000/download/`（-c：同时模拟多少个客户端，-n总共要执行多少次请求）
  - webbench
- 用Linux命令找到性能瓶颈所在（CPU、内存、硬盘、负载？）
  - top：用于检测CPU、内存。服务器跑top，客户端压测跑ab，观察服务器的CPU与内存变化。
  - iostat：用于检测IO设备的带宽。

### Node.js性能分析工具
- **Node.js自带profile**：启动时，加上--prof参数，即`node --prof entry.js`。
  - `ab -c50 -t15 http://127.0.0.1:3000/download/`（-t：总共压测多少秒）
  - 这是项目根目录中会生成一个压测结果log文件。
  - 如何分析这个文件？`node --prof-process 压测结果log文件 > profile.txt`。将分析结果输出到profile.txt文件中。
- **Chrome Devtool**
  - `node --inspect-brk entry.js`。
  - 在Chrome中打开`chrome://inspect`，进入刚才的inspect。
  - 选择`Profiler标签`页，点击`Start CPU Profiling`。
  - 此时，发起压测`ab -c50 -t15 http://127.0.0.1:3000/download/`。
  - 压测结束后，点击结束CPU Profiling。分析测试结果。
- **使用npm包：Clinic.js。**

### 代码优化
#### JavaScript代码性能优化
- 计算性能优化的本质（`提前计算`）
  - 减少不必要的计算。（尽量将中间件内的代码移到外面调用）
  - 空间换时间。

#### 内存管理优化
- 垃圾回收（新生代容量小，垃圾回收快；老生代容量大，来及回收慢）
- 减少内存使用，提高服务性能。Node.js Buffer的内存分配策略。8KB。减少内存使用的最好方式就是`使用池`。
- 避免内存泄漏。

内存检测：
- 使用Chrome Devtool的`Memory标签`。

#### Node优化
**使用Node的C++ Addons：**
- 安装node-gyp，用于将C++代码转换成.node文件。
- 编译命令：`node-gyp rebuild`。
- 将计算量转移到C++进行。
  - 收益：C++运算比JavaScript更快的部分。
  - 成本：C++变量和V8变量的转换。

### 多进程优化
#### Node.js子进程与线程
- 进程
  - 操作系统挂载运行程序的单元；
  - 拥有一些独立的资源，如内存等。
- 线程
  - 进行运算调度的单元；
  - 进程内的线程共享进程内的资源。
- Node.js的事件循环
  - 主线程运行V8与JavaScript；
  - 多个子线程通过事件循环被调度。

#### Node API
- 子进程：fork
- 线程：Worker Thread
- 内置模块cluster

#### 进程守护与管理
- 监听子进程是否挂，若挂则重新创建一个；
- 对子进程进行心跳监控；
- 若子进程内存使用过多，则自杀。

### 架构优化
#### 动静分离
- 静态内容
  - 基本不会变动，不会因为请求参数不同而变化。
  - CDN分发，HTTP缓存等。
- 动态内容
  - 因为请求参数不同而变动。
  - 用大量的源站机器承载，结合反向代理进行负载均衡。

#### 优化方式：反向代理与缓存服务
**反向代理：nginx接收到url，进行处理以后，再将处理过的url转发到node服务；**
- nginx反向代理的路径匹配功能：node服务不需要再去处理url参数，提高一点性能。
- nginx反向代理的负载均衡功能：`upstream`。设置多个服务，nginx就会自动做分发。
- proxy_cache：反向代理还可以做缓存。

**动静态内容优化方式：**
- 静态内容：使用CDN；或者使用nginx来提供静态文件服务，而不是通过node服务提供；
- 动态内容
  - 使用nginx，反向代理，缓存。
  - node服务还可以接入其他缓存服务，比如redis。

**Redis使用的伪代码：**
```javascript
const app = new (require('koa'))
const cacheRedis = require('redis')('cache')
const backupRedis = require('redis')('backup')

app.use(aysnc (ctx, next) => {
  const result = await cacheRedis(ctx.url)
  if (result) {
    ctx.body = result
    return
  }

  await next()

  if (ctx.status === 200) {
    cacheRedis.set(ctx.url, ctx.body, { expire: 200 })
    backupRedis.set(ctx.url, ctx.body, { expire: 200 })
  } else {
    const result = await backupRedis(ctx.url)
    ctx.status = 200
    ctx.body = result
  }
})
```


## 框架与工程化
### 框架设计和工程化
- 做出一个Node.js业务并不难。写demo、在一个小业务尝试上线。
- 但是，把Node.js推广到所有业务线？人员培训、业务管理。

怎么做呢？
- 架构设计
  - 底层更稳固——程序不容易崩溃
  - 更容易往上搭——扩展新功能更方便
- 工程工具
  - 更加易于施工——学习上手成本低
  - 保证施工安全——不会因为操作失误搞挂程序
- 给工程师使用的产品
  - 开发体验，可维护性、可靠性、易用性...
  - KISS原则：keep it simple stupid

### 设计模式
**学习设计模式最主要的不是学习模式，而是理解`设计模式的原则(思想)`，理解要怎么样才能做出架构优秀的程序。**
- 观察者模式：EventEmitter、DOM addEventListener
- 外观模式：jQuery

**设计模式六大法则：**
- 单一职责原则
- 里式替换原则
- 依赖倒转原则
- 接口隔离
- 最小知晓原则
- 开闭原则：多扩展开放，对修改关闭。比如，webpack的loader、plugin等。

### Serverless
- 云函数
  - 不用再因为运维、架构的事情操心
    - 缩短业务上线周期
    - 减少出错的概率
    - 业务开发的上手难度更低
  - 渐进式
- serverless：屏蔽服务器细节，把能在多个业务复用的东西`下沉`。
  - vue/react：domless，屏蔽DOM操作细节
  - jQuery：compatless，屏蔽浏览器兼容细节
  - Node.js：threadless，事件循环，libuv，底层自动做线程管理
  - JavaScript：typeless，屏蔽了类型系统的细节
  - Java/C#：内存鼓励less
  - 可视化开发：编程less
  - ...
  - **通过屏蔽细节(less)，让业务开发更容易。**

### 服务端框架搭建（业务代码与服务器代码解耦）
#### koaless
- 实际上并不是说不用koa，只是把koa的逻辑封装起来，让开发者开发新页面时不需要去理解koa的逻辑；
- 通过配置文件，来指定每个页面的返回。

#### 屏蔽请求细节(数据获取逻辑细节的屏蔽)
- 通过配置文件，针对每个模块提取变量。
- 服务可支持的协议是可扩展的，通过向server注册支持的协议来扩展。

#### 完成服务端框架

### 云函数式工程实现（工作空间 => 云函数 => 服务器下载云函数上的代码）
#### 服务端代码
客户端上传代码到云上，服务器从云上拉取代码。

#### 工具端代码
- 把数据配置以及模板文件进行编译。
- 将编译后的文件上传到云服务器上。
