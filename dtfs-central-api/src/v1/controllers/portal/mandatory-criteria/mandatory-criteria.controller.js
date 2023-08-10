const { getCollection } = require('../../../../drivers/db-client');

const getLatestGefMandatoryCriteria = async (req, res) => {
  const collection = await getCollection('gef-mandatoryCriteriaVersioned');
  const [criteria] = await collection.find({ isInDraft: { $eq: false } }).sort({ version: -1 }).limit(1).toArray();
  if (criteria) {
    return res.status(200).send(criteria);
  }
  return res.status(404).send({ status: 404, message: 'No mandatory criteria found' });
};

const getGefMandatoryCriteriaByVersion = async (req, res) => {
  const { version } = req.params;

  if (!(typeof version === 'string')) {
    return res.status(400).send({ status: 400, message: 'Invalid Version' });
  }

  const collection = await getCollection('gef-mandatoryCriteriaVersioned');
  const criteria = await collection.findOne({ version: { $eq: Number(version) } });
  if (criteria) {
    return res.status(200).send(criteria);
  }
  return res.status(404).send({ status: 404, message: 'No mandatory criteria found' });
};

module.exports = {
  getLatestGefMandatoryCriteria,
  getGefMandatoryCriteriaByVersion,
};
