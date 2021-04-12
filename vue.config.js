module.exports = {
    pluginOptions: {
        quasar: {
            importStrategy: "kebab",
            rtlSupport: false,
        },
    },
    configureWebpack: {
        devtool: "source-map",
    },
    transpileDependencies: ["quasar"],
};
