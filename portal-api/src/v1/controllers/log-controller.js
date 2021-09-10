const db = require('../../drivers/db-client');

exports.logError = async (msg) => {
  const collection = await db.getCollection('errorLog');

  const result = await collection.insertOne({
    time: Date().toString(),
    timestamp: Date.now(),
    ...msg,
  });
  return result;
};

exports.clearErrorLogs = async () => {
  const collection = await db.getCollection('errorLog');
  const result = collection.remove();
  return result;
};
