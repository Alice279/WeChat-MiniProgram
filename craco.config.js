const TestServerUrl = 'https://test.shuttleflow.confluxnetwork.org'
const ProxyConfig = {
  target: TestServerUrl,
  // target: 'https://shuttleflow.io',
  changeOrigin: true,
}

module.exports = {
  style: {
    postcss: {
      plugins: [require('tailwindcss'), require('autoprefixer')],
    },
  },
  devServer: {
    historyApiFallback: true,
    proxy: {
      '/rpcshuttleflow': ProxyConfig,
      '/rpcsponsor': ProxyConfig,
    },
  },
}
