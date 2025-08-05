const { mapCashContingentFacility } = require('./map-cash-contingent-facility');

/**
 * Maps a GEF deal object to a formatted deal structure.
 *
 * @param {object} deal - The deal object to map.
 * @param {object} deal.dealSnapshot - Snapshot of the deal details.
 * @param {object} deal.tfm - TFM-related information for the deal.
 * @returns {object} The mapped deal object with formatted properties.
 */
const mapGefDeal = (deal) => {
  const { dealSnapshot, tfm } = deal;

  const {
    _id,
    dealType,
    bankInternalRefName,
    additionalRefName,
    submissionCount,
    submissionType,
    submissionDate,
    manualInclusionNoticeSubmissionDate,
    status,
    ukefDealId,
    exporter,
    maker,
    facilities,
    supportingInformation,
    eligibility,
    mandatoryVersionId,
  } = dealSnapshot;

  const { companyName, companiesHouseRegistrationNumber, probabilityOfDefault, registeredAddress, selectedIndustry, smeType } = exporter;

  const mapped = {
    _id,
    dealType,
    mandatoryVersionId,
    supportingInformation,
    bankInternalRefName,
    additionalRefName,
    submissionCount,
    submissionType,
    submissionDate,
    manualInclusionNoticeSubmissionDate,
    status,
    ukefDealId,
    eligibility,
    smeType,
    bank: {
      emails: dealSnapshot.bank.emails,
    },
    exporter: {
      companyName,
      companiesHouseRegistrationNumber,
      probabilityOfDefault: Number(probabilityOfDefault),
      registeredAddress,
      selectedIndustry: {
        name: selectedIndustry.name,
        class: selectedIndustry.class.name,
        code: selectedIndustry.class.code,
      },
    },
    maker,
    facilities: facilities.map((facility) => mapCashContingentFacility(facility)),
    tfm,
  };

  return mapped;
};

module.exports = mapGefDeal;
