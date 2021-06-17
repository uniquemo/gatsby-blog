---
title: Gatsby 添加 pathPrefix
date: 2021-06-17
description: 为了能在服务器上部署多个静态站点，给 Gatsby 添加 pathPrefix。
tags: ['工程化']
layout: blog-post
---

## 背景
> 由于资源有限（只有一台服务器），又希望在服务器上部署多个静态站点，多个静态站点之间通过不同的 path 进行区分。如访问我的博客，希望通过 `host/blog/xxx` 来访问。于是有了今天的探索。

## 解决方案
经过一番搜索，找到了解决方案，原来 Gatsby 自身就提供了修改所有资源路径的接口：[Adding a Path Prefix in Gatsby](https://www.gatsbyjs.com/docs/how-to/previews-deploys-hosting/path-prefix/)

### Localhost
具体操作步骤如下：
- 在 `gatsby-config.js` 中添加 `pathPrefix: '/blog'`;
- 然后在 `package.json` 命令 `build` 以及命令 `serve` 后添加 `--prefix-paths` 参数即可;
  - `"build": "gatsby build --prefix-paths"`
  - `"serve": "gatsby serve --prefix-paths",`
- 最后，执行 `yarn build` 后，再执行 `yarn serve`，Done!

### Remote Host
当然，静态站点是需要部署到远端服务器的，这就添加对应的 nginx 配置了：
```bash
location /blog {
  alias /user/share/nginx/html/blog;
}
```
