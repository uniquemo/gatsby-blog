---
title: 浏览器中的页面循环系统--XMLHttpRequest-宏任务和微任务
date: 2020-03-18
description: WebAPI：XMLHttpRequest是怎么实现的？宏任务和微任务：不是所有任务都是一个待遇
tags: ['浏览器']
layout: blog-post
---

## WebAPI：XMLHttpRequest是怎么实现的？

### 回调函数VS系统调用栈
将一个函数作为参数传递给另外一个函数，那作为参数的这个函数就是**回调函数**。
- 同步回调
- 异步回调：`回调函数在主函数外部执行`的过程称为异步回调。

**当循环系统在`执行一个任务的时候`，都要为这个任务维护一个`系统调用栈`。**
- 这个系统调用栈类似于JavaScript的调用栈，只不过系统调用栈是Chromium的开发语言C++来维护的，其完整的调用栈信息你可以通过chrome://tracing/来抓取。
- 也可以通过`Performance`来抓取它核心的调用信息。

**每个任务在执行过程中都有自己的调用栈：**
- 同步回调就是在当前主函数的上下文中执行回调函数。
- 异步回调是指回调函数在主函数之外执行，一般有两种方式：
  - 第一种是**把异步函数做成一个`任务`，添加到`消息队列`尾部**；
  - 第二种是**把异步函数添加到`微任务队列`中，这样就可以在当前任务的末尾处执行微任务了**。


### XMLHttpRequest运作机制
XMLHttpRequest的工作流程如下：
![XMLHttpRequest工作流程](../assets/浏览器/0056_XMLHttpRequest工作流程.png)

```javascript
function GetWebData(URL) {
  // 1: 新建XMLHttpRequest请求对象
  let xhr = new XMLHttpRequest()
  // 2: 注册相关事件回调处理函数 
  xhr.onreadystatechange = function () {
    switch(xhr.readyState){
      case 0: // 请求未初始化
        console.log('请求未初始化')
        break
      case 1: // OPENED
        console.log('OPENED')
        break
      case 2: // HEADERS_RECEIVED
        console.log('HEADERS_RECEIVED')
        break
      case 3: // LOADING  
        console.log('LOADING')
        break
      case 4: // DONE
        if (this.status === 200 || this.status === 304) {
          console.log(this.responseText)
        }
        console.log('DONE')
        break
    }
  }
  xhr.ontimeout = function(e) {
    console.log('ontimeout')
  }
  xhr.onerror = function(e) {
    console.log('onerror')
  }
  // 3: 打开请求
  xhr.open('Get', URL, true)  // 创建一个Get请求, 采用异步
  // 4: 配置参数
  xhr.timeout = 3000  // 设置xhr请求的超时时间
  xhr.responseType = 'text' // 设置响应返回的数据格式
  xhr.setRequestHeader('X_TEST', 'time.geekbang')
  // 5: 发送请求
  xhr.send()
}
```

- **第一步：创建XMLHttpRequest对象。**
- **第二步：为xhr对象注册回调函数。**因为网络请求比较耗时，所以要注册回调函数，这样`后台任务执行完成之后`就会通过调用回调函数来告诉其执行结果。
- **第三步：配置基础的请求信息。**包括请求的`地址`、请求`方法`(get/post)和请求`方式`(同步/异步请求)。然后通过xhr内部属性类配置一些其他可选的请求信息。
- **第四步：发起请求。**
  - 渲染进程会将请求发送给网络进程，然后网络进程负责资源的下载。
  - 等网络进程接收到数据之后，就会利用IPC来通知渲染进程；
  - 渲染进程接收到消息之后，会`将xhr的回调函数封装成任务并添加到消息队列中`，等主线程循环系统执行到该任务的时候，就会根据相关的状态来调用对应的回调函数。


### XMLHttpRequest使用过程中的“坑”

#### 1 跨域问题

#### 2 HTTPS混合内容的问题
- **HTTPS混合内容是HTTPS页面中包含了不符合HTTPS安全要求的内容**，比如包含了HTTP资源，通过HTTP加载的图像、视频、样式表、脚本等，都属于混合内容。
- 通过HTML文件加载的混合资源，虽然给出警告，但大部分类型还是能加载的。而**使用XMLHttpRequest请求时，浏览器认为这种请求可能是攻击者发起的，会阻止此类危险的请求**。


## 宏任务和微任务：不是所有任务都是一个待遇
**微任务可以在实时性和效率之间做一个有效的权衡。**基于微任务的技术有MutationObserver、Promise以及以Promise为基础开发出来的很多其他的技术。

### 宏任务
- 在`消息队列(包括延迟执行队列和普通的消息队列)`中的任务称为宏任务。消息队列中的任务是通过事件循环系统来执行的。
- 宏任务的`时间粒度比较大`，执行的时间间隔是不能精确控制的，对一些高实时性的需求就不太符合，比如监听DOM变化的需求。

页面中的大部分任务都是在主线程上执行的，这些任务包括了：
- 渲染事件（如解析 DOM、计算布局、绘制）；
- 用户交互事件（如鼠标点击、滚动页面、放大缩小等）；
- JavaScript脚本执行事件；
- 网络请求完成、文件读写完成事件。


### 微任务
异步回调的两种方式：
- **第一种是把异步回调函数封装成一个宏任务，添加到消息队列尾部，当循环系统执行到该任务的时候执行回调函数。**setTimeout和XMLHttpRequest的回调函数都是通过这种方式来实现的。
- **第二种方式的执行时机是在`主函数执行结束之后、当前宏任务结束之前`执行回调函数，这通常都是以微任务形式体现的。**

#### 什么是微任务？

**微任务就是一个`需要异步执行的函数`，执行时机是在`主函数执行结束之后、当前宏任务结束之前`。**

**每个宏任务都关联了一个微任务队列。**微任务产生的时机和执行微任务队列的时机是什么？

#### 微任务是怎么产生的？
在现代浏览器里面，产生微任务有两种方式。
- 第一种方式是使用`MutationObserver`监控某个DOM节点，然后再通过JavaScript来修改这个节点，或者为这个节点添加、删除部分子节点，当DOM节点发生变化时，就会产生`DOM变化记录的微任务`。
- 第二种方式是使用`Promise`，当调用Promise.resolve()或者Promise.reject()的时候，也会产生微任务。

#### 微任务队列是何时被执行的？
- 通常情况下，**在当前宏任务中的JavaScript快执行完成时，也就`在JavaScript引擎准备退出全局执行上下文并清空调用栈的时候`，JavaScript引擎会检查`全局执行上下文中的微任务队列`，然后按照顺序执行队列中的微任务**。
- **WHATWG把执行微任务的时间点称为`检查点`**。
- 如果在执行微任务的过程中，产生了新的微任务，同样会将该微任务添加到微任务队列中，V8引擎一直循环执行微任务队列中的任务，直到队列为空才算执行结束。
- 也就是说**在执行微任务过程中产生的新的微任务并不会推迟到下个宏任务中执行，而是在当前的宏任务中继续执行**。

执行一个ParseHTML的宏任务过程中，微任务的添加流程：
![微任务添加流程](../assets/浏览器/0057_微任务添加流程.png)

执行一个ParseHTML的宏任务过程中，微任务的执行流程：
![微任务执行流程](../assets/浏览器/0058_微任务执行流程.png)


### 监听DOM变化方法演变
MutationObserver是用来监听DOM变化的一套方法。

为了解决了`Mutation Event`由于同步调用JavaScript而造成的`性能问题`，从DOM4开始，推荐使用`MutationObserver`来代替Mutation Event。**MutationObserver API可以用来监视DOM的变化，包括属性的变化、节点的增减、内容的变化等。**

那么与Mutation Event相比，MutationObserver到底做了哪些改进呢？
- 针对性能问题，**MutationObserver将响应函数改成异步调用**，可以不用在每次DOM变化都触发回调，而是等多次DOM变化后，`一次触发异步调用`，并且还会使用一个数据结构来`记录`这期间所有的`DOM变化`。这样即使频繁地操纵DOM，也不会对性能造成太大的影响。
- **如何保持消息通知的及时性呢？**如果采用setTimeout创建宏任务来触发回调的话，那么实时性就会大打折扣。在两个任务之间，可能会被渲染进程插入其他的事件，从而影响到响应的实时性。这时候，微任务就可以上场了，**在每次DOM节点发生变化的时候，渲染引擎`将变化记录封装成微任务`，并将微任务添加进当前的微任务队列中。这样当执行到检查点的时候，V8引擎就会按照顺序执行微任务了**。

综上所述， MutationObserver采用了`“异步 + 微任务”`的策略。
- 通过**异步**操作解决了同步操作的**性能问题**；
- 通过**微任务**解决了**实时性的问题**。
