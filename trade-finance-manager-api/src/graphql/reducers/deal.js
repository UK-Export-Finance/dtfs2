const mapFacilities = require('./mapFacilities');
const mapSubmissionDetails = require('./mapSubmissionDetails');

const dealReducer = (deal) => {
  const {
    details,
    submissionDetails,
    eligibility,
    facilities,
  } = deal;

  const {
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
      },
      bankSupplyContractID,
      bankSupplyContractName,
    },
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
    eligibilityCriteria: deal.eligibility.criteria,
  };

  return result;
};

module.exports = dealReducer;
