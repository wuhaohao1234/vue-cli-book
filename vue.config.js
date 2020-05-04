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