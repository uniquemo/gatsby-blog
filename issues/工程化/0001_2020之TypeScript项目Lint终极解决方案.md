说到给TypeScript项目添加lint规则，不知道你有没有这样的疑惑——到底该用TSLint？还是ESLint呢？

首先，TSLint只能用于TypeScript项目，而ESLint同时支持JavaScript和TypeScript项目。

另外，早在2019年的时候，TypeScript团队就公开发表说ESLint较于TSLint有一个更高效的架构，他们后面不会再维护TSLint，转而投入到ESLint中。

所以，基于以上原因，我推荐使用ESLint来给TypeScript项目添加Lint规则。


## 在TypeScript项目中集成ESLint
首先，安装所有开发环境需要的npm包：
```bash
yarn add eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin --dev
```
- eslint：ESLint的核心代码库；
- @typescript-eslint/parser：解析器，让ESLint拥有规范TypeScript代码的能力；
- @typescript-eslint/eslint-plugin：插件，包含一系列TypeScript的ESint规则。

然后，在项目的根目录添加`.eslintrc.js`文件：
```javascript
module.exports = {
  parser: '@typescript-eslint/parser',  // 指定ESLint要使用的解析器
  parserOptions: {
    ecmaVersion: 2020,    // 允许解析较新的ES特性
    sourceType: 'module'
  },
  extends: [
    'plugin:@typescript-eslint/recommended' // 使用@typescript-eslint/eslint-plugin的推荐规则
  ],
  rules: {
    // 防止自定义的ESLint规则，可以覆盖extends中的规则配置。
    // e.g. "@typescript-eslint/explicit-function-return-type": "off",
  }
};
```

如果你在TypeScript项目中使用了React，那么需要安装`eslint-plugin-react`，同时配置文件做如下更改：
```javascript
module.exports = {
  parser: '@typescript-eslint/parser',  // 指定ESLint要使用的解析器
  parserOptions: {
    ecmaVersion: 2020,    // 允许解析较新的ES特性
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true   // 允许解析JSX
    }
  },
  settings: {
    react: {
      version: 'detect' // 告诉eslint-plugin-react自动检测要使用的React版本
    }
  },
  extends: [
    'plugin:react/recommended',   // 使用eslint-plugin-react的推荐规则
    'plugin:@typescript-eslint/recommended' // 使用@typescript-eslint/eslint-plugin的推荐规则
  ],
  rules: {
    // 防止自定义的ESLint规则，可以覆盖extends中的规则配置。
    // e.g. "@typescript-eslint/explicit-function-return-type": "off",
  }
};
```


## 添加Prettier
Prettier之于ESLint，就好比牛奶之于奥利奥，绝配！Prettier在格式化代码方面做得很出色。同样，需要安装相应的依赖：
```bash
yarn add prettier eslint-config-prettier eslint-plugin-prettier --dev
```
- prettier：Prettier的核心代码库；
- eslint-config-prettier：用于禁用与Prettier有冲突的ESLint规则；
- eslint-plugin-prettier：将Prettier作为ESLint的规则来运行。这样就可以通过ESLint的`--fix`来自动修复代码了。

同样，需要在根目录添加`.prettierrc.js`配置文件：
```javascript
module.exports = {
  semi: true,
  trailingComma: "all",
  singleQuote: true,
  printWidth: 120,
  tabWidth: 4
};
```

然后，需要修改`.eslintrc.js`配置文件：
```javascript
module.exports = {
  parser: '@typescript-eslint/parser',  // 指定ESLint要使用的解析器
  parserOptions: {
    ecmaVersion: 2020,    // 允许解析较新的ES特性
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true   // 允许解析JSX
    }
  },
  settings: {
    react: {
      version: 'detect' // 告诉eslint-plugin-react自动检测要使用的React版本
    }
  },
  extends: [
    'plugin:react/recommended',   // 使用eslint-plugin-react的推荐规则
    'plugin:@typescript-eslint/recommended' // 使用@typescript-eslint/eslint-plugin的推荐规则
    "prettier/@typescript-eslint",  // 使用eslint-config-prettier来禁用@typescript-eslint/eslint-plugin中与prettier冲突的ESLint规则
    // 启用eslint-plugin-prettier和eslint-config-prettier。这会将prettier错误作为ESLint错误来展示。确保这个配置放到数组的最后。
    "plugin:prettier/recommended"
  ],
  rules: {
    // 防止自定义的ESLint规则，可以覆盖extends中的规则配置。
    // e.g. "@typescript-eslint/explicit-function-return-type": "off",
  }
};
```


## 在VSCode中自动修复代码
在VSCode中，若保存文件时自动执行ESLint的修复命令，开发体验会更好。可以在VSCode的`settings.json`文件中做如下配置：
```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
}
```


## 通过CLI命令执行ESLint
在package.json文件中，添加一个lint scripts命令：
```json
{
  "scripts": {
    "lint": "eslint '*/**/*.{js,ts,tsx}' --fix"
  }
}
```

这样，就可以通过`npm run lint`或者`yarn lint`来执行ESLint检测了，所有可以被ESLint自动修复的代码会自动修复，不能被修复的会在控制台中输出。


## 在Git Commit前执行ESLint
为了确保所有通过git commit的文件都不会有lint或者格式化错误，可以使用`lint-staged`工具。

`lint-staged`工具允许在文件commit前执行lint命令，可以与`husky`搭配使用，通过git hooks做相应的配置，在package.json文件中添加：
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,ts,tsx}": [
      "eslint --fix"
    ]
  }
}
```


## 总结
最后，总结一下，2020之TypeScript项目Lint终极解决方案如下：
- 使用ESLint搭配Prettier，其中ESLint做代码检测，Prettier做代码格式化；
- 使用lint-staged和husky，通过git hooks自动执行ESLint检测，写优雅的代码！

插个广告：[我的个人音乐项目已使用了该Lint方案，具体看代码](https://github.com/uniquemo/react-netease-music)

文章最新发表于我的微信公众号，欢迎关注，持续更新中！

![前端酱微信公众号二维码](https://user-gold-cdn.xitu.io/2020/4/12/1716a0bc9b3f1937?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)


## References
- [How to Setup a TypeScript + Node.js Project](https://khalilstemmler.com/blogs/typescript/node-starter-project/)
- [How to use ESLint with TypeScript](https://khalilstemmler.com/blogs/typescript/eslint-for-typescript/)
- [How to use Prettier with ESLint and TypeScript in VSCode](https://khalilstemmler.com/blogs/tooling/prettier/)
