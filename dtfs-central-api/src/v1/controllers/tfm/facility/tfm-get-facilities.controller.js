const { ObjectId } = require('mongodb');
const escapeStringRegexp = require('escape-string-regexp');
const db = require('../../../../drivers/db-client');
const CONSTANTS = require('../../../../constants');

exports.getFacilitiesByDealId = async (req, res) => {
  const { id: dealId } = req.params;

  if (!ObjectId.isValid(dealId)) {
    return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
  }

  const collection = await db.getCollection('tfm-facilities');
  // NOTE: only GEF facilities have dealId.
  // this could be adapted so that we get the deal, check dealType,
  // then search for either dealId or dealId.
  const facilities = await collection.find({ 'facilitySnapshot.dealId': { $eq: ObjectId(dealId) } }).toArray();
  return res.status(200).send(facilities);
};

exports.getAllFacilities = async (req, res) => {
  const facilitiesCollection = await db.getCollection('tfm-facilities');

  const {
    searchString, sortBy, pagesize, page = 0
  } = req.query;

  const pageNumber = Number(page);

  const fieldsToSortOn = {};
  if (sortBy) {
    fieldsToSortOn[sortBy.field] = sortBy.order === CONSTANTS.FACILITIES.SORT_BY.ASCENDING ? 1 : -1;
  }
  if (sortBy?.field !== 'ukefFacilityId') {
    fieldsToSortOn.ukefFacilityId = 1;
  }

  const searchStringEscaped = escapeStringRegexp(searchString || '');

  /**
   * mongodb query that returns an array of objects with the following format:
   * [{
   *    "amendments": [amendments-array]
   *     "tfmFacilities": {
   *        "dealId": "Mock deal Id",
   *        "facilityId": "Mock facility Id",
   *        "ukefFacilityId": "0030136443",
   *        "dealType": "GEF",
   *        "type": "Cash",
   *        "value": 1000000,
   *        "currency": "GBP",
   *        "coverEndDate": "2021-08-12T00:00:00.000Z",.
   *        "companyName": "Mock company name",
   *        "hasBeenIssued": true
   *     }
   * }]
   */
  const doc = await facilitiesCollection.aggregate([
    {
      $lookup: {
        from: 'tfm-deals',
        localField: 'facilitySnapshot.dealId',
        foreignField: '_id',
        as: 'tfmDeals'
      }
    },
    {
      $unwind: '$tfmDeals'
    },
    {
      $project: {
        _id: false,
        companyName: '$tfmDeals.dealSnapshot.exporter.companyName',
        ukefFacilityId: '$facilitySnapshot.ukefFacilityId',
        // amendments array for mapping completed amendments
        amendments: '$amendments',
        tfmFacilities: {
          // create the `dealId` property
          dealId: '$facilitySnapshot.dealId',
          // create the `facilityId` property
          facilityId: '$facilitySnapshot._id',
          // create the `ukefFacilityId` property
          ukefFacilityId: '$facilitySnapshot.ukefFacilityId',
          // create the `dealType` property - this is inside the `dealSnapshot` property, NOT `facilities` array
          dealType: '$tfmDeals.dealSnapshot.dealType',
          // create the `type` property
          type: '$facilitySnapshot.type',
          // create the `value` property - this is the facility value
          value: '$facilitySnapshot.value',
          // create the `currency` property
          currency: '$facilitySnapshot.currency.id',
          // create the `coverEndDate` property
          // GEF already has this property, but BSS doesn't have it in this format, so we need to create it dynamically
          coverEndDate: {
            $switch: {
              branches: [
                {
                  case: { $eq: ['$tfmDeals.dealSnapshot.dealType', 'GEF'] },
                  then: '$facilitySnapshot.coverEndDate', // YYYY-MM-DD
                },
                {
                  case: { $eq: ['$tfmDeals.dealSnapshot.dealType', 'BSS/EWCS'] },
                  then: { $concat: ['$facilitySnapshot.coverEndDate-year', '-', '$facilitySnapshot.coverEndDate-month', '-', '$facilitySnapshot.coverEndDate-day'] }, // YYYY-MM-DD
                },
              ],
            },
          },
          // create the `companyName` property - this is inside the `dealSnapshot.exporter` property, NOT `facilities` array
          companyName: '$tfmDeals.dealSnapshot.exporter.companyName',
          // create the `hasBeenIssued` property
          hasBeenIssued: '$facilitySnapshot.hasBeenIssued',
        }
      }
    },
    {
      // search functionality based on ukefFacilityId property OR companyName
      $match: {
        $or: [
          {
            ukefFacilityId: {
              $regex: searchStringEscaped,
              $options: 'i'
            }
          },
          {
            companyName: {
              $regex: searchStringEscaped,
              $options: 'i'
            }
          },
        ],
      },
    },
    {
      $addFields: {
        facilityStage: {
          $cond: {
            if: '$tfmFacilities.hasBeenIssued',
            then: 'Issued',
            else: 'Unissued',
          }
        }
      }
    },
    {
      $sort: {
        ...fieldsToSortOn,
      },
    },
    {
      $unset: 'facilityStage'
    },
    {
      $facet: {
        count: [{ $count: 'total' }],
        facilities: [{ $skip: pageNumber * (pagesize ?? 0) }, ...(pagesize ? [{ $limit: parseInt(pagesize, 10) }] : [])],
      },
    },
    { $unwind: '$count' },
    {
      $project: {
        count: '$count.total',
        facilities: true,
      },
    },
  ]).toArray();

  if (!doc.length) {
    const pagination = {
      totalItems: 0,
      currentPage: pageNumber,
      totalPages: 1,
    };
    return res.status(200).send({ facilities: [], pagination });
  }
  const { count, facilities } = doc[0];

  const pagination = {
    totalItems: count,
    currentPage: pageNumber,
    totalPages: pagesize ? Math.ceil(count / pagesize) : 1,
  };

  if (facilities) {
    res.status(200).send({ facilities, pagination });
  }

  return res.status(404).send();
};
