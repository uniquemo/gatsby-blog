- 大型复杂 GUI 软件（如 IDE 类）如何组织功能模块代码
- 如何使用 Electron 技术将 Web 软件桌面化
- 如何在打造插件化开放生态的同时保证软件整体质量与性能
- 如何打造一款好用的、流行的工具软件

对于工具软件而言，需要内心能想清楚边界。哪些是自己应该专注去做的，哪些可以外溢到交给第三方扩展来满足。

VSCode 的核心是“编辑器 + 代码理解 + 调试“。


## Electron（跨平台）
Electron = Chromium + Node.js + Native APIS
- 使用 Web 技术来编写 UI，用 chrome 浏览器内核来运行
- 使用 NodeJS 来操作文件系统和发起网络请求
- 使用 NodeJS C++ Addon 去调用操作系统的 native API

### Electron应用架构
- 1 个主进程：一个 Electron App 只会启动一个主进程，它会运行 package.json 的 main 字段指定的脚本
- N 个渲染进程：主进程代码可以调用 Chromium API 创建任意多个 web 页面，而 Chromium 本身是多进程架构，每个 web 页面都运行在属于它自己的渲染进程中

进程间通讯：
- Render 进程之间的通讯本质上和多个 Web 页面之间通讯没有差别，可以使用各种浏览器能力如 localStorage
- Render 进程与 Main 进程之间也可以通过 API 互相通讯 (ipcRenderer/ipcMain)

### Electron web和普通web页面的对比
- 普通 web 页面无法调用 native api，因此缺少一些能力；
- electron 的 web 页面所处的 Render 进程可以将任务转发至运行在 NodeJS 环境的 Main 进程
  - 从而实现 native API这套架构大大扩展了 electron app 相比 web app 的能力丰富度；
  - 但同时又保留了 web 快捷流畅的开发体验，再加上 web 本身的跨平台优势，结合起来让 electron 成为性价比非常高的方案。


## VSCode技术架构（多进程架构）
- 主进程：VSCode 的入口进程，负责一些类似窗口管理、进程间通信、自动更新等全局任务
- 渲染进程：负责一个 Web 页面的渲染
- 插件宿主进程：每个插件的代码都会运行在一个独属于自己的 NodeJS 环境的宿主进程中，插件不允许访问 UI
- Debug 进程：Debugger 相比普通插件做了特殊化
- Search 进程：搜索是一类计算密集型的任务，单开进程保证软件整体体验与性能

### 源码组织
#### 1、隔离内核 (src) 与插件 (extensions)，内核分层模块化
- /src/vs：分层和模块化的 core
  - /src/vs/base: 通用的公共方法和公共视图组件
  - /src/vs/code: VSCode 应用主入口
  - /src/vs/platform：可被依赖注入的各种纯服务
  - /src/vs/editor: 文本编辑器
  - /src/vs/workbench：整体视图框架
  - /src/typings: 公共基础类型
- /extensions：内置插件

#### 2、每层按环境隔离
内核里面每一层代码都会遵守 electron 规范，按不同环境细分文件夹:
- common: 公共的 js 方法，在哪里都可以运行的
- browser: 只使用浏览器 API 的代码，可以调用 common
- node: 只使用 NodeJS API 的代码，可以调用 common
- electron-browser: 使用 electron 渲染线程和浏览器 API 的代码，可以调用 common，browser，node
- electron-main: 使用 electron 主线程和 NodeJS API 的代码，可以调用 common， node
- test: 测试代码

实际开发中也遇到了类似问题，作为一个 低代码 + 可视化 的研发平台，许多功能模块的实现都需要横跨编辑态和运行态，如果代码不加以限制和区分，很容易导致错误的依赖关系和预期之外的 bug，因此最终也决定采用 (editor/runtime/common) 类似的隔离架构。

#### 3、内核代码本身也采用扩展机制: Contrib
可以看到 /src/vs/workbench/contrib 这个目录下存放着非常多的 VSCode 的小的功能单元。

Contrib 主要是使用 Core 暴露的一些扩展点来做事情。

Contrib 和 Extension 的对比：
- extension 每一个都是运行在归宿于自己的独立宿主进程，而 contrib 的功能基本是要运行在主进程的
- extension 只能依附于 core 开放的扩展点而活，但是 contrib 可以通过依赖注入拿到所有 core 内部实现的 class （虽然官方不推荐）

#### 4、依赖注入
TS 依赖注入常见的实现原理是使用 reflect-metadata 设置与获取元信息，从而可以实现在运行时拿到本来属于编辑态的 TypeScript 类型相关元信息。

不过具体到 VSCode 的依赖注入，它没有使用 reflect-metadata 这一套，而是基于 decorator 去标注元信息，整个实现了一套自己的依赖注入方式，大致包含如下几类角色：
- Service：服务的实现逻辑
- Interface：服务的接口描述
- Client：服务使用方
- Manager：服务管理器

#### 5、绝对路径 import
- 绝对路径 import 是一个非常值得学习的技巧，具体的方式是配置 TypeScript compilerOptions.paths；
- 相对路径 import 对阅读者的大脑负担高，依赖当前文件位置上下文信息才能理解重构代码的时候移动文件位置；
- 相对路径需要修改本文件的所有 import，绝对路径不需要。

#### 6、命令系统
命令系统是中心化的，各功能末端变成了扁平化的结构。
- 需要暴露命令的各个模块往命令系统中注册功能命令；
- 需要调用命令的模块，从命令系统中调用。

#### 7、TypeScript

### 启动流程（TLDR）
- 入口：package.json { "main": "./out/main" } : electron 的标准启动入口
- '/out/main.js': 是构建产物的入口文件，它对应源码 '/src/main.js'


## 代码编辑器技术
- monaco-editor 文本编辑器；
- language server protocol 语言提示， 也是 vscode 的一大创举：
  - 不再关注 AST 和 Parser，转而关注 Document 和 Position，从而实现语言无关。
  - 将语言提示变成 CS 架构，核心抽象成当点击了文档的第几行第几列位置需要 server 作出什么响应的一个简单模型，基于 JSON RPC 协议传输，每个语言都可以基于协议实现通用后端。
- Debug Adaptor Prototal: 调试协议。

Render Process => RPC => Node Extension Host => LSP/Debug Protocol => 各种语言的server


## VSCode 插件系统
### VSCode 插件的强隔离
Main Process => IPC => Render Process => RPC => Node Extension Host => 各个插件
- 独立进程：VSCode plugin 代码运行在只属于自己的独立 Extension Host 宿主进程里
- 逻辑与视图隔离：插件完全无法访问 DOM 以及操作 UI，插件只能响应 VSCode Core 暴露的扩展点
- 视图扩展能力非常弱：VSCode 有非常稳定的交互与视觉设计，提供给插件的 UI 上的洞（component slot）非常少且稳定
- 只能使用限制的组件来扩展：VSCode 对视图扩展的能力限制非常强，洞里面的 UI 是并不能随意绘制的，只能使用一些官方提供的内置组件，比如 TreeView 之类

### Workbench 视图结构
- 标题栏: Title Bar（顶部横条）
- 活动栏: Activity Bar（最左边tab）
- 侧边栏: Side Bar（树状结构）
- 面板: Panal（控制台区域）
- 编辑器: Editor
- 状态栏: Status Bar（底部横条）

可扩展的视图结构：
- Tree View Container
- Tree View
- Status Bar Item
- Webview

### 插件 API 注入
插件开发者调用 core 能力时需要引入名为 vscode 的 npm 模块。

那么具体这些 API 在 plugin 执行上下文是何时注入的呢？其实是在插件 import 语句执行的时候动了手脚。
- /src/vs/workbench/api/common/extHostRequireInterceptor.ts
- vscode plugin 的 require 全部被 Microsoft/vscode-loader 劫持了，通过对 require 的 hack 将插件 API 注入到了运行环境。


## 总结
在尝试打造每一个开发者都梦想的万物皆 plugin 式的工具软件之前，有一些通用的问题需要先冷静下来思考：
- 用户核心在操作的资源是什么？
- 用户的关键路径是什么？
- 这个软件的整体功能形态，交互与视觉设计已经稳定了吗？
- 内核功能区和第三方扩展的功能域之间的界限在哪里？
- 哪些环节可能会出现外溢需求需要第三方扩展才能被满足，不适宜官方动手做吗？

对 VSCode 而言：
- 核心操作的资源是文件
- 关键路径是：打开文件 - 编辑文件 - 保存文件
- 整体功能设计，交互与视觉设计非常稳定
- 内核是文件管理与代码编辑，多样性的编程语言生态，CICD 等衍生研发链路等可能会出现扩展需求


## References
- [从 VSCode 看大型 IDE 技术架构](https://zhuanlan.zhihu.com/p/96041706)


疑问：
- 依赖注入
- LSP
