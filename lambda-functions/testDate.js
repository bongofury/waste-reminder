exports.handler = async (e) => {
  console.log('hit testDate fnc alive', e);
  return {
    statusCode: 200,
    body: {
      current: new Date().toISOString(),
    },
  };
};
