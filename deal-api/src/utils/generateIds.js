const db = require('../drivers/db-client');

const generateDealId = async () => {
  const collection = await db.getCollection('idCounters');
  const { value } = await collection.findOneAndUpdate(
    { _id: 'DEAL_COUNTER' },
    {
      $inc: { count: 1 },
    },
  );

  return `${value.count}`;
};

const generateFacilityId = async () => {
  const collection = await db.getCollection('idCounters');
  const { value } = await collection.findOneAndUpdate(
    { _id: 'FACILITY_COUNTER' },
    {
      $inc: { count: 1 },
    },
  );
  return `${value.count}`;
};

module.exports = {
  generateDealId,
  generateFacilityId,
};
