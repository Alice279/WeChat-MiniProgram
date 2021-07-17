module.exports = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8001/api/:path*",
      },
      {
        source: "/static/:path*",
        destination: "http://127.0.0.1:8001/static/:path*",
      },
    ];
  },
};
