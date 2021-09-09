const db = require('../../drivers/db-client');

exports.addDurableFunctionLog = async ({ type, data }) => {
  const collection = await db.getCollection('durable-functions-log');

  const result = await collection.insertOne({
    ...data,
    type,
    status: 'Running',
    submittedDate: new Date().toISOString(),
  });
  return result;
};

exports.clearDurableFunctionLogs = async () => {
  const collection = await db.getCollection('durable-functions-log');
  const result = collection.remove();
  return result;
};
