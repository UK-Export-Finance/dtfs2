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
  const searchString = req.body.searchString || '';

  // mongodb query that returns an array of objects with the following format:
  // [{
  //       "tfmFacilities": {
  //           "dealId": "Mock deal Id",
  //           "facilityId": "Mock facility Id",
  //           "ukefFacilityId": "0030136443",
  //           "dealType": "GEF",
  //           "facilityType": "Cash",
  //           "value": 1000000,
  //           "currency": "GBP",
  //           "coverEndDate": "2021-08-12T00:00:00.000Z",
  //           "companyName": "Mock company name",
  //           "hasBeenIssued": true
  //       }
  // }]

  const facilities = await collection.aggregate([
    {
      $project: {
        _id: 0,
        tfmFacilities: {
          $map: {
            input: '$dealSnapshot.facilities',
            as: 'facilities', // alias for dealSnapshot.facilities array
            in: {
              // create the `dealId` property
              dealId: '$$facilities.dealId',
              // create the `facilityId` property
              facilityId: '$$facilities._id',
              // create the `ukefFacilityId` property
              ukefFacilityId: '$$facilities.ukefFacilityId',
              // create the `dealType` property - this is inside the `dealSnapshot` property, NOT `facilities` array
              dealType: '$dealSnapshot.dealType',
              // create the `facilityType` property
              facilityType: {
                $switch: {
                  branches: [
                    {
                      case: { $eq: ['$dealSnapshot.dealType', 'GEF'] },
                      then: '$$facilities.type',
                    },
                    {
                      case: { $eq: ['$dealSnapshot.dealType', 'BSS/EWCS'] },
                      then: '$$facilities.facilityType',
                    },
                  ],
                },
              },
              // create the `value` property - this is the facility value
              value: '$$facilities.value',
              // create the `currency` property
              currency: '$$facilities.currency.id',
              // create the `coverEndDate` property
              // GEF already has this property, but BSS doesn't have it in this format, so we need to create it dynamically
              coverEndDate: {
                $switch: {
                  branches: [
                    {
                      case: { $eq: ['$dealSnapshot.dealType', 'GEF'] },
                      then: '$$facilities.coverEndDate', // YYYY-MM-DD
                    },
                    {
                      case: { $eq: ['$dealSnapshot.dealType', 'BSS/EWCS'] },
                      then: { $concat: ['$$facilities.coverEndDate-year', '-', '$$facilities.coverEndDate-month', '-', '$$facilities.coverEndDate-day'] }, // YYYY-MM-DD
                    },
                  ],
                },
              },
              // create the `companyName` property - this is inside the `dealSnapshot.exporter` property, NOT `facilities` array
              companyName: '$dealSnapshot.exporter.companyName',
              // create the `hasBeenIssued` property
              hasBeenIssued: '$$facilities.hasBeenIssued',
            },
          },
        },
      },
    },
    { $unwind: '$tfmFacilities' },
    {
      // search functionality based on ukefFacilityId property OR companyName
      $match: {
        $or: [
          { 'tfmFacilities.ukefFacilityId': { $regex: searchString, $options: 'i' } },
          { 'tfmFacilities.companyName': { $regex: searchString, $options: 'i' } },
        ],
      },
    },
    // sort based on the ukefFacilityId - this is default behavior
    { $sort: { 'tfmFacilities.ukefFacilityId': -1 } },

  ]).toArray();

  res.status(200).send(facilities);
};
