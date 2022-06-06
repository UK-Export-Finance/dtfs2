const { getCollection } = require('../../../../drivers/db-client');

const getLatestGefMandatoryCriteria = async (req, res) => {
  const collection = await getCollection('gef-mandatoryCriteriaVersioned');
  const [criteria] = await collection.find({ isInDraft: false }).sort({ version: -1 }).limit(1).toArray();
  if (criteria) {
    return res.status(200).send(criteria);
  }
  return res.status(404).send({ status: 404, message: 'No mandatory criteria found' });
};

const getGefMandatoryCriteriaByVersion = async (req, res) => {
  const { version } = req.params;
  const collection = await getCollection('gef-mandatoryCriteriaVersioned');
  const criteria = await collection.findOne({ version: Number(version) });
  if (criteria) {
    return res.status(200).send(criteria);
  }
  return res.status(404).send({ status: 404, message: 'No mandatory criteria found' });
};

module.exports = {
  getLatestGefMandatoryCriteria,
  getGefMandatoryCriteriaByVersion,
};
