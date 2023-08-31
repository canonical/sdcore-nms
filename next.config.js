module.exports = {
    async redirects() {
      return [
        {
          source: '/',
          destination: '/network-configuration',
          permanent: true,
        },
      ]
    },
  }
