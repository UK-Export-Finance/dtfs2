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
    status,
    ukefDealId,
    exporter,
    facilities,
  } = dealSnapshot;

  const mapped = {
    _id,
    dealType,
    bankSupplyContractID: bankInternalRefName,
    bankAdditionalReferenceName: additionalRefName,
    submissionCount,
    submissionType,
    submissionDate,
    status,
    ukefDealId,
    exporter: {
      companyName: exporter.companyName,
      companiesHouseRegistrationNumber: exporter.companiesHouseRegistrationNumber,
    },
    facilities,
    tfm,
  };

  return mapped;
};

module.exports = mapGefDeal;
