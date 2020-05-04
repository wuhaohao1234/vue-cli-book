# vue-cli-book
vue-cli知识点

## 一、构建工具

```
# 查看 node 版本
node -v

# 查看 npm 版本
npm -v
```

## 二、脚手架vue-cli

```
# 安装 Vue CLI 3.x
npm i -g @vue/cli
```

安装完 vue-cli 后，我们在你当前的项目目录地址下执行构建命令

```
vue create .
```

## webpack 在 CLI 3 中的应用

如果你使用过 vue-cli 2.x，那么你应该了解其构建出的目录会包含相应的 webpack配置文件，但是在 vue-cli 3.x 中你却见不到一份关于 webpack 的配置文件，难道 3.x 抛弃了 webpack？其实不然，3.x 提供了一种开箱即用的模式，即你无需配置 webpack 就可以运行项目，并且它提供了一个 vue.config.js 文件来满足开发者对其封装的 webpack 默认配置的修改

## vue.config.js 的配置

### publicPath

> 你想要将项目地址加一个二级目录，比如：http://localhost:8080/vue/，那么我们需要在 vue.config.js 里配置 publickPath 这一项

```
module.exports = {
    publicPath: 'vue'
}
```

打包后的路径:

```
<!DOCTYPE html>
<html lang=en>

<head>
    <meta charset=utf-8>
    <meta http-equiv=X-UA-Compatible content="IE=edge">
    <meta name=viewport content="width=device-width,initial-scale=1">
    <link rel=icon href=vue/favicon.ico>
    <title>vue-cli-book</title>
    <link href=vue/js/about.ac6f0aea.js rel=prefetch>
    <link href=vue/css/app.65742655.css rel=preload as=style>
    <link href=vue/js/app.1effddc7.js rel=preload as=script>
    <link href=vue/js/chunk-vendors.69e3e4d8.js rel=preload as=script>
    <link href=vue/css/app.65742655.css rel=stylesheet>
</head>

<body><noscript><strong>We're sorry but vue-cli-book doesn't work properly without JavaScript enabled. Please enable it
            to continue.</strong></noscript>
    <div id=app></div>
    <script src=vue/js/chunk-vendors.69e3e4d8.js></script>
    <script src=vue/js/app.1effddc7.js></script>
</body>

</html>
```

### outputDir

> 如果你想将构建好的文件打包输出到 output 文件夹下（默认是 dist 文件夹），你可以配置
```
module.exports = {
    publicPath: 'vue',
    outputDir: 'outputDir'
}
```
然后运行命令 yarn build 进行打包输出，你会发现项目跟目录会创建 output 文件夹， 这其实改变了 webpack 配置中 output 下的 path项，修改了文件的输出路径
### productionSourceMap

> 如果你不需要生产环境的 source map，可以将其设置为 false 以加速生产环境构建。

```
module.exports = {
    publicPath: 'vue',
    outputDir: 'outputDir',
    productionSourceMap: false    
}
```
该配置会修改 webpack 中 devtool 项的值为 source-map


## chainWebpack

chainWebpack 配置项允许我们更细粒度的控制 webpack的内部配置，其集成的是 webpack-chain 这一插件，该插件可以让我们能够使用链式操作来修改配置，比如

```
const merge = require('webpack-merge');
module.exports = {
    publicPath: 'vue',
    outputDir: 'outputDir',
    productionSourceMap: false,
    chainWebpack: config => {
        config.module
            .rule('images')
            .use('url-loader')
            .tap(options =>
                merge(options,{
                    limit: 5120,
                })
            )
    }
}
```

以上操作我们可以成功修改 webpack 中 module 项里配置 rules 规则为图片下的 url-loader 值，将其 limit 限制改为 5M

## devServer

vue.config.js 还提供了 devServer 项用于配置 webpack-dev-server 的行为，使得我们可以对本地服务器进行相应配置，我们在命令行中运行的 yarn serve 对应的命令 vue-cli-service serve 其实便是基于 webpack-dev-server 开启的一个本地服务器，其常用配置参数如下

```
// vue.config.js
module.exports = {
    devServer: {
        open: true, // 是否自动打开浏览器页面
        host: '0.0.0.0', // 指定使用一个 host。默认是 localhost
        port: 8080, // 端口地址
        https: false, // 使用https提供服务
        proxy: null, // string | Object 代理设置
        
        // 提供在服务器内部的其他中间件之前执行自定义中间件的能力
        before: app => {
          // `app` 是一个 express 实例
        }
    }
    
}
```

## 路径别名与导入icon

```
const path = require('path')
function resolve(dir) {
  console.log(__dirname)
  return path.join(__dirname,dir)
}

module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  chainWebpack: (config) => {
    config.entry('main').add('babel-polyfill')
    config.module
      .rule('image')
      .test(/\.ico$/)
      .use('url-loader')
      .loader('url-loader')
    config.resolve.alias
      .set('@',resolve('src')) // key,value自行定义，比如.set('@@', resolve('src/components'))
      .set('@components',resolve('src/components'))
      .set('@images',resolve('src/assets/images'))
  },
}
```

## Vue CLI3之pages 构建多页应用

首先我们可以把多页应用理解为由多个单页构成的应用，而何谓多个单页呢？其实你可以把一个单页看成是一个 html 文件，那么多个单页便是多个 html 文件，多页应用便是由多个 html 组成的应用，如下图所示

既然多页应用拥有多个 html，那么同样其应该拥有多个独立的入口文件、组件、路由、vuex 等。没错，说简单一点就是多页应用的每个单页都可以拥有单页应用 src 目录下的文件及功能，我们来看一下一个基础多页应用的目录结构

```
├── node_modules               # 项目依赖包目录
├── build                      # 项目 webpack 功能目录
├── config                     # 项目配置项文件夹
├── src                        # 前端资源目录
│   ├── images                 # 图片目录
│   ├── components             # 公共组件目录
│   ├── pages                  # 页面目录
│   │   ├── page1              # page1 目录
│   │   │   ├── components     # page1 组件目录
│   │   │   ├── router         # page1 路由目录
│   │   │   ├── views          # page1 页面目录
│   │   │   ├── page1.html     # page1 html 模板
│   │   │   ├── page1.vue      # page1 vue 配置文件
│   │   │   └── page1.js       # page1 入口文件
│   │   ├── page2              # page2 目录
│   │   └── index              # index 目录
│   ├── common                 # 公共方法目录
│   └── store                  # 状态管理 store 目录
├── .gitignore                 # git 忽略文件
├── .env                       # 全局环境配置文件
├── .env.dev                   # 开发环境配置文件
├── .postcssrc.js              # postcss 配置文件
├── babel.config.js            # babel 配置文件
├── package.json               # 包管理文件
├── vue.config.js              # CLI 配置文件
└── yarn.lock                  # yarn 依赖信息文件
```

多入口

在单页应用中，我们的入口文件只有一个，CLI 默认配置的是 main.js，但是到了多页应用，我们的入口文件便包含了 page1.js、page2.js、index.js等，数量取决于 pages 文件夹下目录的个数，这时候为了项目的可拓展性，我们需要自动计算入口文件的数量并解析路径配置到 webpack 中的 entry 属性上，如：

```
module.exports = {
    ...
    
    entry: {
        page1: '/xxx/pages/page1/page1.js',
        page2: '/xxx/pages/page2/page2.js',
        index: '/xxx/pages/index/index.js',
    },
    
    ...
}
```

那么我们如何读取并解析这样的路径呢，这里就需要使用工具和函数来解决了。我们可以在根目录新建 build 文件夹存放 utils.js 这样共用的 webpack 功能性文件，并加入多入口读取解析方法

```
/* utils.js */
const path = require('path');

// glob 是 webpack 安装时依赖的一个第三方模块，该模块允许你使用 * 等符号,
// 例如 lib/*.js 就是获取 lib 文件夹下的所有 js 后缀名的文件
const glob = require('glob');

// 取得相应的页面路径，因为之前的配置，所以是 src 文件夹下的 pages 文件夹
const PAGE_PATH = path.resolve(__dirname, '../src/pages');

/* 
* 多入口配置
* 通过 glob 模块读取 pages 文件夹下的所有对应文件夹下的 js * 后缀文件，如果该文件存在
* 那么就作为入口处理
*/
exports.getEntries = () => {
    let entryFiles = glob.sync(PAGE_PATH + '/*/*.js') // 同步读取所有入口文件
    let map = {}
    
    // 遍历所有入口文件
    entryFiles.forEach(filePath => {
        // 获取文件名
        let filename = filePath.substring(filePath.lastIndexOf('\/') + 1, filePath.lastIndexOf('.'))
        
        // 以键值对的形式存储
        map[filename] = filePath 
    })
    
    return map
}
```

读取并存储完毕后，我们得到了一个入口文件的对象集合，这个对象我们便可以将其设置到 webpack 的 entry 属性上，这里我们需要修改 vue.config.js 的配置来间接修改 webpack 的值

```
/* vue.config.js */

const utils = require('./build/utils')

module.exports = {
    ...
    
    configureWebpack: config => {
        config.entry = utils.getEntries()
    },
    
    ...
}
```

这样我们多入口的设置便完成了，当然这并不是 CLI 所希望的操作，后面我们会进行改进。

多模板

相对于多入口来说，多模板的配置也是大同小异，这里所说的模板便是每个 page 下的 html 模板文件，而模板文件的作用主要用于 webpack 中 html-webpack-plugin 插件的配置，其会根据模板文件生产一个编译后的 html 文件并自动加入携带 hash 的脚本和样式，基本配置如下