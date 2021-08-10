const db = require('../../drivers/db-client');

exports.addDurableFunctionLog = async ({ type, data }) => {
  const collection = await db.getCollection('durable-functions-log');

  return collection.insertOne({
    ...data,
    type,
    status: 'Running',
    submittedDate: new Date().toISOString(),
  });
};
