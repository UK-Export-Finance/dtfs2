const { format, getUnixTime } = require('date-fns');
const commaNumber = require('comma-number');
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
      facility: tfmFacility
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

    const dbFacilities = await api.getAllFacilities(queryParams);

    const facilities = dbFacilities.map((dbFacility) => {
      const { tfmFacilities: facility } = dbFacility;

      if (!facility.ukefFacilityId) {
        facility.ukefFacilityId = '-';
      }

      const latestCompletedAmendment = findLatestCompletedAmendment(dbFacility?.amendments);
      let facilityCoverEndDate = '';
      let facilityCoverEndDateEpoch = '';

      const formatCoverEndDate = format(new Date(facility.coverEndDate), 'dd MMM yyyy'); // 11 Aug 2021
      if (facility.coverEndDate && REGEX.DATE.test(formatCoverEndDate)) {
        facilityCoverEndDate = formatCoverEndDate;
        facilityCoverEndDateEpoch = getUnixTime(new Date(facility.coverEndDate));
      }

      let facilityCurrencyAndValue = `${facility.currency} ${commaNumber(facility.value)}`;
      let facilityValue = parseInt(facility.value, 10);

      if (latestCompletedAmendment?.value) {
        const { value, currency } = latestCompletedAmendment.value;
        const formattedFacilityValue = formatFacilityValue(value);
        facilityCurrencyAndValue = `${currency} ${commaNumber(formattedFacilityValue)}`;
        facilityValue = parseInt(value, 10);
      }

      if (latestCompletedAmendment?.coverEndDate) {
        const { coverEndDate } = latestCompletedAmendment;
        // * 1000 to convert to ms epoch time format so can be correctly formatted by template
        facilityCoverEndDate = format(new Date(coverEndDate * 1000), 'dd MMM yyyy');
        facilityCoverEndDateEpoch = coverEndDate;
      }

      facility.coverEndDate = facilityCoverEndDate;
      // the EPOCH format is required to sort the facilities based on date
      facility.coverEndDateEpoch = facilityCoverEndDateEpoch;
      facility.currencyAndValue = facilityCurrencyAndValue;
      facility.value = facilityValue;

      return facility;
    });

    return res.status(200).send({ tfmFacilities: facilities });
  } catch (error) {
    console.error('Error fetching facilities %o', error);
    return res.status(500).send(error.message);
  }
};

const updateFacility = async (req, res) => {
  const { facilityId } = req.params;
  const facilityUpdate = req.body;
  try {
    const updatedFacility = await api.updateFacility(facilityId, facilityUpdate);
    return res.status(200).send({
      updateFacility: updatedFacility.tfm
    });
  } catch (error) {
    console.error('Unable to update facility: %d', error);
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

const updateTfmFacility = async (facilityId, tfmUpdate) => {
  const updatedFacility = await api.updateFacility(facilityId, tfmUpdate);
  return updatedFacility.tfm;
};

const updateTfmFacilityRiskProfile = async (facilityId, tfmUpdate) => {
  const updatedFacility = await api.updateFacility(facilityId, tfmUpdate);
  return updatedFacility.tfm;
};

module.exports = {
  getFacility,
  getFacilities,
  updateFacility,
  getAllFacilities,
  findOneFacility,
  updateTfmFacility,
  updateTfmFacilityRiskProfile,
};
