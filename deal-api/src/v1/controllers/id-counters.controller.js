const db = require('../../drivers/db-client');

/*
email from Kamran Ellah 21/05/20
Portal_deal_id is int(10)  max 4294967295    , current value less than 5000
Portal_facility_id is int(11) max 2147483648  , current value less than 20000

Current ID’s in testing/PPD environment is:
Portal_deal_id   37868
Portal_facility_id  40328

Need to have much higher id's to avoid collision
*/

const initCounter = [
  {
    _id: 'DEAL_COUNTER',
    count: 1000000,
  },
  {
    _id: 'FACILITY_COUNTER',
    count: 1000000,
  },
];

exports.reset = async (req, res) => {
  const collection = await db.getCollection('idCounters');
  await collection.deleteMany({});

  await collection.insertMany(initCounter);
  res.status(200).send(initCounter);
};
