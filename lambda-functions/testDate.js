exports.handler = async (e) => {
  console.log('hit testDate fnc alive', e);
  return {
    statusCode: 200,
    body: JSON.stringify({
      current: new Date().toISOString(),
    }),
  };
};
