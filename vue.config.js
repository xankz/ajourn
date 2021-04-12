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
    publicPath: "/ajourn/",
    transpileDependencies: ["quasar"],
};
