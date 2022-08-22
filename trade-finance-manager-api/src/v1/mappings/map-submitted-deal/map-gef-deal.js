const { mapCashContingentFacility } = require('./map-cash-contingent-facility');

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

  const mapped = {
    _id,
    dealType,
    supportingInformation,
    bankInternalRefName,
    additionalRefName,
    submissionCount,
    submissionType,
    submissionDate,
    manualInclusionNoticeSubmissionDate,
    status,
    ukefDealId,
    exporter: {
      companyName: exporter.companyName,
      companiesHouseRegistrationNumber: exporter.companiesHouseRegistrationNumber,
      probabilityOfDefault: Number(exporter.probabilityOfDefault),
    },
    maker,
    facilities: facilities.map((facility) => mapCashContingentFacility(facility)),
    tfm,
  };

  // these extra fields are only used in GEF submission confirmation email
  mapped.bank = {
    emails: dealSnapshot.bank.emails,
  };

  mapped.exporter = {
    ...mapped.exporter,
    registeredAddress: exporter.registeredAddress,
    selectedIndustry: {
      name: exporter.selectedIndustry.name,
      class: exporter.selectedIndustry.class.name,
    },
    smeType: exporter.smeType,
  };

  mapped.eligibility = eligibility;
  mapped.mandatoryVersionId = mandatoryVersionId;
  return mapped;
};

module.exports = mapGefDeal;
