---
title: 20200306-ChromeDevTool
date: 2020-03-06
description: Chrome Dev Tools Tips and Tricks等
layout: review-post
---

### Review
拖延症犯啦~😳


### 文章阅读
- [My Favorite Chrome Dev Tools Tips and Tricks](https://www.freecodecamp.org/news/awesome-chrome-dev-tools-tips-and-tricks/)

**My Favorite Chrome Dev Tools Tips and Tricks**

- jQuery style DOM queries in the console
  - $ = document.querySelector()
  - $$ = document.querySelectorAll()
  - 当不知道具体怎么获取某元素时，可通过选中该元素，然后在console中输入`$0`即可（$0 - $4均可，即可记住last 5个选中的元素）
```javascript
$('#root').click()
```
- Copying an element's properties（比如，可以复制某个元素的selector）
- Filtering network requests
- Emulating different network speeds
- Using Live Expressions in console（Console面板，有个类似眼睛的图标`Create live expression`，方便debug）
- Emulating different devices
- Forcing an element's state（:hover，:active等）
