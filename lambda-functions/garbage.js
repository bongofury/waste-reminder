const getGarbageResponse = require('./garbage-logic/garbageLogic');

exports.handler = async () => ({
  statusCode: 200,
  body: JSON.stringify(getGarbageResponse()),
});
