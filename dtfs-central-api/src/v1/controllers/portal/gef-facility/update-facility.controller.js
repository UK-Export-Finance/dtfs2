const { ObjectId } = require('mongodb');
const db = require('../../../../drivers/db-client');

exports.updateFacility = async (id, updateBody) => {
  try {
    const facilitiesCollection = await db.getCollection('facilities');
    const dealsCollection = await db.getCollection('deals');

    let updatedFacility;

    const existingFacility = await facilitiesCollection.findOne({ _id: ObjectId(id) });

    if (existingFacility) {
      updatedFacility = await facilitiesCollection.findOneAndUpdate({ _id: ObjectId(id) }, { $set: updateBody }, { returnOriginal: false });
      if (updatedFacility) {
        // update facilitiesUpdated timestamp in the deal
        const dealUpdateObj = { facilitiesUpdated: new Date().valueOf() };

        await dealsCollection.findOneAndUpdate(
          { _id: { $eq: ObjectId(existingFacility.dealId) } },
          { $set: dealUpdateObj },
          { returnOriginal: false },
        );
      }
    }

    return updatedFacility;
  } catch (e) {
    console.error('Unable to update the facility', { e });
    return e;
  }
};
