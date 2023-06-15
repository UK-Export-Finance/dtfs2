import { getCollection } from '../../database';

export const addDurableFunctionLog = async ({ type, data }: any) => {
  const collection = await getCollection('durable-functions-log');

  return collection.insertOne({
    ...data,
    type,
    status: 'Running',
    submittedDate: new Date().toISOString(),
  });
};
