const { ObjectId } = require('mongodb');
const db = require('../../../../drivers/db-client');

const facilitiesCollection = 'facilities';
const dealsCollectionName = 'deals';

const updateFacility = async (id, updateBody) => {
  try {
    const collection = await db.getCollection(facilitiesCollection);
    const dealsCollection = await db.getCollection(dealsCollectionName);

    let updatedFacility = null;

    const facilityId = ObjectId(String(id));
    const existingFacility = await collection.findOne({ _id: facilityId });
    const existingApplication = await dealsCollection.findOne({ _id: ObjectId(existingFacility.dealId) });
    console.log('existing', existingFacility, existingApplication, updateBody);
    if (existingFacility) {
      console.log(facilityId, id);
      updatedFacility = await collection.updateOne(
        { _id: { $eq: facilityId } },
        { $set: updateBody },
        {},
      );
      console.log('->>>', updatedFacility);
    }
    console.log('update', updatedFacility);
    if (existingFacility && existingApplication) {
      console.log('reaching this block');
      // update facilitiesUpdated timestamp in the deal
      const dealUpdateObj = {
        facilitiesUpdated: new Date().valueOf(),
      };

      const updatee = await dealsCollection.findOneAndUpdate(
        { _id: { $eq: ObjectId(existingFacility.dealId) } },
        { $set: dealUpdateObj },
        { returnOriginal: false },
      );

      console.log('!!!', updatee);
    }
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    return updatedFacility;
  } catch (e) {
    console.error('Unable to update the facility', { e });
    return e;
  }
};

module.exports = { updateFacility };
