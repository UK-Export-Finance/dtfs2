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

  const facilities = await collection.aggregate([
    {
      $project: {
        _id: 0,
        tfmFacility: {
          $map: {
            input: '$dealSnapshot.facilities',
            as: 'facilities',
            in: {
              dealId: '$$facilities.dealId',
              facilityId: '$$facilities._id',
              ukefFacilityId: '$$facilities.ukefFacilityId',
              dealType: '$dealSnapshot.dealType',
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
              value: '$$facilities.value',
              currency: '$$facilities.currency.id',
              coverEndDate: {
                $switch: {
                  branches: [
                    {
                      case: { $eq: ['$dealSnapshot.dealType', 'GEF'] },
                      then: '$$facilities.coverEndDate',
                    },
                    {
                      case: { $eq: ['$dealSnapshot.dealType', 'BSS/EWCS'] },
                      then: { $concat: ['$$facilities.coverEndDate-day', '-', '$$facilities.coverEndDate-month', '-', '$$facilities.coverEndDate-year'] },
                    },
                  ],
                },
              },
              companyName: '$dealSnapshot.exporter.companyName',
              hasBeenIssued: {
                $switch: {
                  branches: [
                    {
                      case: { $eq: ['$dealSnapshot.dealType', 'GEF'] },
                      then: '$$facilities.hasBeenIssued',
                    },
                    {
                      case: {
                        $and: [
                          { $eq: ['$dealSnapshot.dealType', 'BSS/EWCS'] },
                          { $eq: ['$$facilities.facilityType', 'bond'] },
                          { $eq: ['$$facilities.facilityStage', 'Issued'] },
                        ],
                      },
                      then: true,
                    },
                    {
                      case: {
                        $and: [
                          { $eq: ['$dealSnapshot.dealType', 'BSS/EWCS'] },
                          { $eq: ['$$facilities.facilityType', 'bond'] },
                          { $eq: ['$$facilities.facilityStage', 'Unissued'] },
                        ],
                      },
                      then: false,
                    },
                    {
                      case: {
                        $and: [
                          { $eq: ['$dealSnapshot.dealType', 'BSS/EWCS'] },
                          { $eq: ['$$facilities.facilityType', 'loan'] },
                          { $eq: ['$$facilities.facilityStage', 'Conditional'] },
                        ],
                      },
                      then: false,
                    },
                    {
                      case: {
                        $and: [
                          { $eq: ['$dealSnapshot.dealType', 'BSS/EWCS'] },
                          { $eq: ['$$facilities.facilityType', 'loan'] },
                          { $eq: ['$$facilities.facilityStage', 'Unconditional '] },
                        ],
                      },
                      then: true,
                    },

                  ],
                  default: false,
                },
              },
            },
          },
        },
      },
    },
    { $unwind: '$tfmFacility' },
    {
      $match: {
        $or: [
          { 'tfmFacility.ukefFacilityId': { $regex: searchString, $options: 'i' } },
          { 'tfmFacility.companyName': { $regex: searchString, $options: 'i' } },
        ],
      },
    },
    { $sort: { 'tfmFacility.ukefFacilityId': 1 } },

  ]).toArray();

  res.status(200).send(facilities);
};
