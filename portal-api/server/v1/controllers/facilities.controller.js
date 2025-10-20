// const { mapFacilityFieldsToAmendmentFields } = require('@ukef/dtfs2-common');
const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { mongoDbClient: db } = require('../../drivers/db-client');
const api = require('../api');
const { escapeOperators } = require('../helpers/escapeOperators');
const computeSkipPosition = require('../helpers/computeSkipPosition');
const { updateDeal } = require('./deal.controller');

/**
 * Create a facility (BSS, EWCS only)
 */
exports.create = async (facilityBody, user, auditDetails) => {
  const createdFacility = await api.createFacility(facilityBody, user, auditDetails);

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
exports.findOne = async (facilityId) => api.findOneFacility(facilityId);

exports.update = async (dealId, facilityId, facilityBody, user, auditDetails) => {
  const updatedFacility = await api.updateFacility(facilityId, facilityBody, user, auditDetails);

  if (updatedFacility) {
    // update facilitiesUpdated timestamp in the deal

    const dealUpdate = {
      facilitiesUpdated: new Date().valueOf(),
    };

    await updateDeal({ dealId, dealUpdate, user, auditDetails });
  }

  return updatedFacility;
};

/**
 * Delete a facility (BSS, EWCS only)
 */
exports.delete = async (facilityId, user, auditDetails) => api.deleteFacility(facilityId, user, auditDetails);

/**
 * Create multiple facilities (BSS, EWCS only)
 */
exports.createMultiple = async (req, res) => {
  const {
    body: { facilities, dealId },
    user,
  } = req;

  const auditDetails = generatePortalAuditDetails(user._id);

  const { data: ids } = await api.createMultipleFacilities(facilities, dealId, user, auditDetails);

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
exports.createMultipleFacilities = async (facilities, dealId, user, auditDetails) => api.createMultipleFacilities(facilities, dealId, user, auditDetails);

/**
 * Queries all facilities in the facilities collection (BSS, EWCS, GEF)
 * @param {object} filters any filters for deals or facilities, uses match spec
 * @param {object} sort any additional sort fields for list
 * @param {number} start where list should start - part of pagination.
 * @param {number} pagesize Size of each page - limits list results
 * @returns combined and formatted list of facilities
 */
const queryAllFacilities = async (filters = {}, sort = {}, start = 0, pagesize = 0) => {
  const startPage = computeSkipPosition(start, filters, sort);

  const collection = await db.getCollection('facilities');

  const results = await collection
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
      { $match: escapeOperators(filters) },
      {
        $project: {
          _id: true,
          dealId: '$deal._id',
          submissionType: '$deal.submissionType',
          name: '$name',
          ukefFacilityId: '$ukefFacilityId',
          currency: '$currency',
          value: '$value',
          type: '$type',
          hasBeenIssued: '$hasBeenIssued',
          submittedAsIssuedDate: '$submittedAsIssuedDate',
          updatedAt: { $toDouble: '$updatedAt' },
          exporter: '$deal.exporter.companyName',
          // exporter in lowercase for sorting
          lowerExporter: { $toLower: '$deal.exporter.companyName' },
          // Facility stage - specifically used for Risk expired
          facilityStage: '$facilityStage',
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
          facilities: [{ $skip: startPage }, ...(pagesize ? [{ $limit: pagesize }] : [])],
        },
      },
      { $unwind: '$count' },
      {
        $project: {
          count: '$count.total',
          facilities: true,
        },
      },
    ])
    .toArray();

  if (results.length) {
    const { count, facilities } = results[0];

    if (!count || !facilities.length) {
      return {
        facilities: [],
        count: 0,
      };
    }

    const mappedFacilities = [];

    /**
     * loops through all facilities and checks if there are any amendments for each facility
     * if there are amendments, it maps the relevant fields to the facility object and pushes the facility to the mappedFacilities array
     * if there are no amendments, it pushes the facility object as is to the mappedFacilities array
     */
    for (const eachFacility of facilities) {
      const facility = eachFacility;

      // const amendments = await api.getAcknowledgedAmendmentsByFacilityId(facility._id);

      // if (amendments?.length) {
      //   /**
      //    * returns the latest cover end date and/or value from the amendments array
      //    * if either field does not exist in the amendments, it will not be returned
      //    * (i.e. if only cover end date has been amended, value will not be returned)
      //    */
      //   const { coverEndDate, value } = mapFacilityFieldsToAmendmentFields(amendments);

      //   if (value) {
      //     facility.value = value;
      //   }

      //   if (coverEndDate) {
      //     facility.coverEndDate = new Date(coverEndDate);
      //   }
      // }

      mappedFacilities.push(facility);
    }

    return {
      count,
      facilities,
    };
  }

  return {
    facilities: [],
    count: 0,
  };
};

exports.queryAllFacilities = queryAllFacilities;

exports.getQueryAllFacilities = async (req, res) => {
  const { start, pagesize, filters, sort } = req.body;

  const results = await queryAllFacilities(filters, sort, start, pagesize);

  return res.status(200).send(results);
};
