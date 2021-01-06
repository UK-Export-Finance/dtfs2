const { findOneFacility } = require('./get-facility.controller');
const db = require('../../../drivers/db-client');

exports.deleteFacility = async (req, res) => {
  findOneFacility(req.params.id, async (facility) => {
    if (facility) {
      const collection = await db.getCollection('facilities');
      const status = await collection.deleteOne({ _id: req.params.id });
      return res.status(200).send(status);
    }

    return res.status(404).send();
  });
};
