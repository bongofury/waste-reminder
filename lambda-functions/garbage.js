const getGarbageResponse = require('./garbageLogic');

exports.handler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify(getGarbageResponse()),
  };
};
