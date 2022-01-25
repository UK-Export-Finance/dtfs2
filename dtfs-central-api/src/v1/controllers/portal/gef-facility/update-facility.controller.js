const { ObjectID } = require('mongodb');
const db = require('../../../../drivers/db-client');

const facilitiesCollection = 'facilities';
const dealsCollectionName = 'deals';

const updateFacility = async (id, updateBody) => {
  try {
    const collection = await db.getCollection(facilitiesCollection);
    const dealsCollection = await db.getCollection(dealsCollectionName);

    let updatedFacility = null;

    const facilityId = ObjectID(String(id));
    const existingFacility = await collection.findOne({ _id: facilityId });

    if (existingFacility) {
      updatedFacility = await collection.findOneAndUpdate(
        { _id: { $eq: facilityId } },
        { $set: updateBody },
        { returnOriginal: false },
      );
    }

    if (existingFacility) {
    // update facilitiesUpdated timestamp in the deal
      const dealUpdateObj = {
        facilitiesUpdated: new Date().valueOf(),
      };

      await dealsCollection.findOneAndUpdate(
        { _id: { $eq: ObjectID(existingFacility.dealId) } },
        { $set: dealUpdateObj },
        { returnOriginal: false },
      );
    }
    return updatedFacility;
  } catch (e) {
    console.error('Unable to update the facility', { e });
    return e;
  }
};

module.exports = { updateFacility };
