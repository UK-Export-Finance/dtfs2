const { ObjectID } = require('mongodb');
const db = require('../../../../drivers/db-client');

const findFacilitiesByDealId = async (dealId) => {
  const collection = await db.getCollection('tfm-facilities');

  // NOTE: only GEF facilities have dealId.
  // this could be adapted so that we get the deal, check dealType,
  // then search for either dealId or dealId.
  const facilities = await collection.find({ 'facilitySnapshot.dealId': { $eq: ObjectID(dealId) } }).toArray();

  return facilities;
};
exports.findFacilitiesByDealId = findFacilitiesByDealId;

exports.findFacilitiesGet = async (req, res) => {
  const facilities = await findFacilitiesByDealId(req.params.id);

  return res.status(200).send(facilities);
};

exports.getAllFacilities = async (req, res) => {
  const collection = await db.getCollection('tfm-deals');
  const facilities = await collection.aggregate([
    {
      $project: {
        _id: 0,
        tfmFacilities: {
          $map: {
            input: '$dealSnapshot.facilities',
            as: 'facilities',
            in: {
              applicationId: '$$facilities.applicationId',
              facilityId: '$$facilities._id',
              ukefFacilityId: '$$facilities.ukefFacilityId',
              dealType: '$dealSnapshot.dealType',
              facilityType: '$$facilities.type',
              facilityValue: '$$facilities.value',
              coverEndDate: '$$facilities.coverEndDate',
              companyName: '$dealSnapshot.exporter.companyName',
              hasBeenIssued: '$$facilities.hasBeenIssued',
              currency: '$$facilities.currency',
            },
          },
        },
      },
    },
  ]).toArray();

  res.status(200).send(facilities[0].tfmFacilities);
};
