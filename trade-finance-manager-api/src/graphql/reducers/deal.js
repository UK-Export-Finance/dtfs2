const mapTotals = require('./mappings/mapTotals');
const mapFacilities = require('./mappings/facilities/mapFacilities');
const mapSubmissionDetails = require('./mapSubmissionDetails');

// TODO: add unit test
// so that when this is changed, tests fail.

const dealReducer = (deal) => {
  const {
    details,
    submissionDetails,
    eligibility,
    facilities,
    tfm,
  } = deal;

  const {
    ukefDealId,
    status,
    submissionDate,
    submissionType,
    owningBank,
    bankSupplyContractID,
    bankSupplyContractName,
    maker,
  } = details;

  const result = {
    _id: deal._id, // eslint-disable-line no-underscore-dangle
    ukefDealId,
    details: {
      status,
      submissionDate,
      submissionType,
      owningBank: {
        name: owningBank.name,
        emails: owningBank.emails,
      },
      maker: {
        firstname: maker.firstname,
        surname: maker.surname,
        email: maker.email,
      },
      bankSupplyContractID,
      bankSupplyContractName,
    },
    totals: mapTotals(facilities),
    facilities: mapFacilities(facilities),
    submissionDetails: mapSubmissionDetails(submissionDetails),
    eligibility: {
      agentAddressCountry: eligibility.agentAddressCountry.name,
      agentAddressLine1: eligibility.agentAddressLine1,
      agentAddressLine2: eligibility.agentAddressLine2,
      agentAddressLine3: eligibility.agentAddressLine3,
      agentAddressPostcode: eligibility.agentAddressPostcode,
      agentAddressTown: eligibility.agentAddressTown,
      agentName: eligibility.agentName,
    },
    eligibilityCriteria: eligibility.criteria,
    tfm,
  };

  return result;
};

module.exports = dealReducer;
