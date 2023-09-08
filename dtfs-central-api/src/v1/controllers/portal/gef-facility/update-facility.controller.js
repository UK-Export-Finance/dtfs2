const { ObjectId } = require('mongodb');
const db = require('../../../../drivers/db-client');

const updateFacility = async (id, updateBody) => {
  if (!ObjectId.isValid(id)) {
    return { status: 400, message: 'Invalid Facility Id' };
  }

  try {
    const facilitiesCollection = await db.getCollection('facilities');
    const dealsCollection = await db.getCollection('deals');

    let updatedFacility;

    const existingFacility = await facilitiesCollection.findOne({ _id: { $eq: ObjectId(id) } });

    if (existingFacility) {
      const { dealId } = existingFacility;

      if (dealId !== undefined && !ObjectId.isValid(dealId)) {
        throw new Error('Invalid Deal Id');
      }

      updatedFacility = await facilitiesCollection.findOneAndUpdate(
        { _id: { $eq: ObjectId(id) } },
        { $set: updateBody },
        { returnNewDocument: true, returnDocument: 'after' }
      );

      if (updatedFacility) {
        // update facilitiesUpdated timestamp in the deal
        const dealUpdateObj = { facilitiesUpdated: new Date().valueOf() };

        await dealsCollection.updateOne(
          { _id: { $eq: ObjectId(dealId) } },
          { $set: dealUpdateObj },
        );
      }
    }

    return updatedFacility;
  } catch (error) {
    console.error('Unable to update the facility %s', error);
    return {};
  }
};
exports.updateFacility = updateFacility;

exports.updateFacilityPut = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    const facilityId = req.params.id;
    const facilityUpdate = req.body;

    const updatedFacility = await updateFacility(facilityId, facilityUpdate);

    if (updatedFacility) {
      return res.status(200).json(updatedFacility);
    }

    return res.status(404).send({ status: 404, message: 'The facility ID doesn\'t exist' });
  }
  return res.status(400).send({ status: 400, message: 'Invalid Facility Id' });
};
