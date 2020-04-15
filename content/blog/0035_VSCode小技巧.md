---
title: VSCode小技巧
date: 2020-04-13
description: 提升开发效率的VSCode小技巧。
tags: ['编辑器']
layout: blog-post
---

## 格式化代码
### 如何将代码缩进从tab转换为2个space？
1. 进入编辑器设置页，选择Edit in settings.json，添加如下配置。
```json
{
  "editor.tabSize": 2,
  "editor.detectIndentation": false // 是否检测文件原本的缩进格式
}
```

2. 安装VSCode格式化代码插件Beautify。
3. 打开要格式化的代码文件，cmd + shift + p，输入beautify file并选中，done。

### 如何为特定类型文件指定缩进大小、类型(空格/tab)？
在项目中新建`.editorconfig`文件：
```javascript
root = true

[*]
charset = utf-8
indent_style = tab
indent_size = 4
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
max_line_length = off
trim_trailing_whitespace = false
```
