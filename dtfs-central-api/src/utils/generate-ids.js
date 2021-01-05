const db = require('../drivers/db-client');

const generateDealId = async () => {
  const collection = await db.getCollection('idCounters');
  const { value } = await collection.findOneAndUpdate(
    { _id: 'DEAL_COUNTER' },
    {
      $inc: { count: 1 },
    },
  );

  if (!value) {
    const initValue = {
      _id: 'DEAL_COUNTER',
      count: 1000000,
    };
    await collection.insert(initValue);
    return generateDealId();
  }

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

  if (!value) {
    const initValue = {
      _id: 'FACILITY_COUNTER',
      count: 1000000,
    };
    await collection.insert(initValue);
    return generateFacilityId();
  }

  return `${value.count}`;
};

module.exports = {
  generateDealId,
  generateFacilityId,
};
