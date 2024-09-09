const { format, getUnixTime } = require('date-fns');
const commaNumber = require('comma-number');
const { generateTfmAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const api = require('../api');
const { findOneTfmDeal } = require('./deal.controller');
const facilityMapper = require('../rest-mappings/facility');
const { findLatestCompletedAmendment } = require('../rest-mappings/helpers/amendment.helpers');
const REGEX = require('../../constants/regex');
const formatFacilityValue = require('../rest-mappings/helpers/formatFacilityValue.helper');

const getFacility = async (req, res) => {
  try {
    const { facilityId } = req.params;
    const facility = await api.findOneFacility(facilityId);

    const { dealId } = facility.facilitySnapshot;
    const deal = await findOneTfmDeal(dealId);

    const { dealSnapshot, tfm: dealTfm } = deal;
    const tfmFacility = facilityMapper(facility, dealSnapshot, dealTfm);

    return res.status(200).send({
      facility: tfmFacility,
    });
  } catch (error) {
    console.error('Error fetching facility %o', error);
    return res.status(500).send(error.message);
  }
};

const getFacilities = async (req, res) => {
  try {
    const queryParams = req.query;

    if (!queryParams) {
      return res.status(400).send();
    }

    const { facilities: dbFacilities, pagination } = await api.getAllFacilities({ queryParams });

    const facilities = dbFacilities.map((dbFacility) => {
      const { tfmFacilities: facility } = dbFacility;

      if (!facility.ukefFacilityId) {
        facility.ukefFacilityId = '-';
      }

      const { value: latestAmendmentValue, coverEndDate: latestAmendmentCoverEndDate } = findLatestCompletedAmendment(dbFacility?.amendments);
      let facilityCoverEndDate = '';
      let facilityCoverEndDateEpoch = '';

      const formatCoverEndDate = format(new Date(facility.coverEndDate), 'dd MMM yyyy'); // 11 Aug 2021
      if (facility.coverEndDate && REGEX.DATE.test(formatCoverEndDate)) {
        facilityCoverEndDate = formatCoverEndDate;
        facilityCoverEndDateEpoch = getUnixTime(new Date(facility.coverEndDate));
      }

      let facilityCurrencyAndValue = `${facility.currency} ${commaNumber(facility.value)}`;
      let facilityValue = parseInt(facility.value, 10);

      if (latestAmendmentValue) {
        const { value, currency } = latestAmendmentValue;
        const formattedFacilityValue = formatFacilityValue(value);
        facilityCurrencyAndValue = `${currency} ${commaNumber(formattedFacilityValue)}`;
        facilityValue = parseInt(value, 10);
      }

      if (latestAmendmentCoverEndDate) {
        // * 1000 to convert to ms epoch time format so can be correctly formatted by template
        facilityCoverEndDate = format(new Date(latestAmendmentCoverEndDate * 1000), 'dd MMM yyyy');
        facilityCoverEndDateEpoch = latestAmendmentCoverEndDate;
      }

      facility.coverEndDate = facilityCoverEndDate;
      // the EPOCH format is required to sort the facilities based on date
      facility.coverEndDateEpoch = facilityCoverEndDateEpoch;
      facility.currencyAndValue = facilityCurrencyAndValue;
      facility.value = facilityValue;

      return facility;
    });

    return res.status(200).send({ facilities, pagination });
  } catch (error) {
    console.error('Error fetching facilities %o', error);
    return res.status(500).send(error.message);
  }
};

const updateFacility = async (req, res) => {
  const { facilityId } = req.params;
  const facilityUpdate = req.body;
  try {
    const updatedFacility = await api.updateFacility({
      facilityId,
      tfmUpdate: facilityUpdate,
      auditDetails: generateTfmAuditDetails(req.user._id),
    });
    return res.status(200).send({
      updateFacility: updatedFacility.tfm,
    });
  } catch (error) {
    console.error('Unable to update facility %o', error);
    return res.status(500).send({ data: 'Unable to update facility' });
  }
};

const findOneFacility = async (_id) => {
  const facility = await api.findOneFacility(_id);
  return facility;
};

const getAllFacilities = async (searchString) => {
  const allFacilities = await api.getAllFacilities(searchString);
  return allFacilities;
};

module.exports = {
  getFacility,
  getFacilities,
  updateFacility,
  getAllFacilities,
  findOneFacility,
};
