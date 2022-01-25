const db = require('../../drivers/db-client');
const api = require('../api');
const { updateDeal } = require('./deal.controller');

/**
 * Create a facility (BSS, EWCS only)
 */
exports.create = async (facilityBody, user) => {
  const createdFacility = await api.createFacility(facilityBody, user);

  const { status, data } = createdFacility;
  const { _id } = data;

  const facility = await api.findOneFacility(_id);

  return {
    status,
    data: facility,
  };
};

/**
 * Find a facility (BSS, EWCS only)
 */
exports.findOne = async (facilityId) =>
  api.findOneFacility(facilityId);

exports.update = async (dealId, facilityId, facilityBody, user) => {
  const updatedFacility = await api.updateFacility(facilityId, facilityBody, user);

  if (updatedFacility) {
    // update facilitiesUpdated timestamp in the deal

    const dealUpdate = {
      facilitiesUpdated: new Date().valueOf(),
    };

    await updateDeal(
      dealId,
      dealUpdate,
      user,
    );
  }

  return updatedFacility;
};

/**
 * Delete a facility (BSS, EWCS only)
 */
exports.delete = async (facilityId, user) =>
  api.deleteFacility(facilityId, user);

/**
 * Create multiple facilities (BSS, EWCS only)
 */
exports.createMultiple = async (req, res) => {
  const { facilities, dealId, user } = req.body;

  const { data: ids } = await api.createMultipleFacilities(facilities, dealId, user);

  const allFacilities = await Promise.all(
    ids.map(async (id) => {
      const facility = await api.findOneFacility(id);
      return facility;
    }),
  );

  return res.status(200).send(allFacilities);
};

/**
 * Create multiple facilities (BSS, EWCS only)
 */
exports.createMultipleFacilities = async (facilities, dealId, user) =>
  api.createMultipleFacilities(facilities, dealId, user);

/**
* Queries all facilities in the facilities collection (BSS, EWCS, GEF)
* @param {*} filters any filters for list, uses match spec
* @param {*} sort any additional sort fields for list
* @param {*} start where list should start - part of pagination.
* @param {*} pagesize Size of each page - limits list results
* @returns combined and formatted list of facilities
*/
exports.queryAllFacilities = async (
  filters = {},
  sort = {},
  start = 0,
  pagesize = 0,
) => {
  const collection = await db.getCollection('facilities');

  const doc = await collection
    .aggregate([
      {
        $lookup: {
          from: 'deals',
          localField: 'dealId',
          foreignField: '_id',
          as: 'deal',
        },
      },
      { $unwind: '$deal' },
      { $match: filters },
      {
        $project: {
          _id: 1,
          dealId: '$deal._id',
          submissionType: '$deal.submissionType',
          name: 'mock name', // what is this in BSS?
          ukefFacilityId: '$ukefFacilityId',
          currency: '$currency',
          value: '$value',
          type: '$type',
          hasBeenIssued: '$hasBeenIssued',
          submittedAsIssuedDate: '$submittedAsIssuedDate',
        },
      },
      {
        $sort: {
          ...sort,
          updatedAt: -1,
        },
      },
      {
        $facet: {
          count: [{ $count: 'total' }],
          facilities: [
            { $skip: start },
            ...(pagesize ? [{ $limit: pagesize }] : []),
          ],
        },
      },
      { $unwind: '$count' },
      {
        $project: {
          count: '$count.total',
          facilities: 1,
        },
      },
    ])
    .toArray();

  return doc;
};
