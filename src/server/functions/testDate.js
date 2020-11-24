exports.handler = () => ({
  statusCode: 200,
  body: {
    current: new Date().toISOString(),
  },
});
