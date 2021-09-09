const { ObjectID } = require('bson');
const db = require('../../../../drivers/db-client');

const findOneExporter = async (exporterId) => {
  const collection = await db.getCollection('gef-exporter');
  const exporter = collection.findOne({ _id: ObjectID(exporterId) });

  return exporter;
};
exports.findOneExporter = findOneExporter;

exports.findOneExporterGet = async (req, res) => {
  const exporter = await findOneExporter(req.params.id);

  if (exporter) {
    return res.status(200).send(exporter);
  }

  return res.status(404).send();
};
