

module.exports = {
    webpack: {
        //webpack5中不在主动引用nodejs的核心模块，需要手动引用
        //在react项目中，要么通过npm eject暴露所有配置，手动管理webpack.config.js
        //要么通过craco来修改webpack的配置
        //这里选择通过craco来修改配置，手动添加stream-browserify引用
        configure: (webpackConfig) => {
            webpackConfig.resolve.fallback = {
                "stream": require.resolve("stream-browserify"),
            }

            return webpackConfig;
        }
    }
};