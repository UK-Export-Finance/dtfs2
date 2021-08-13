const db = require('../../../../drivers/db-client');

const createExporter = async (exporter) => {
  const collection = await db.getCollection('gef-exporter');

  const response = await collection.insertOne(exporter);

  const createdDeal = response.ops[0];

  return createdDeal;
};

exports.createExporterPost = async (req, res) => {
  const exporter = await createExporter(req.body);

  return res.status(200).send(exporter);
};
