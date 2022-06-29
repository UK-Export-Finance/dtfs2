const { DEAL_TYPE } = require('../../../constants/deals');

const automaticAmendmentEmailVariables = (amendmentVariables) => {
  const { amendment, dealSnapshot, user } = amendmentVariables;
  const { ukefFacilityId } = amendment;
  const { exporter, ukefDealId, bankInternalRefName, dealType, details } = dealSnapshot;
  const { firstname, surname } = user;

  let ukefDealIdFromDeal = ukefDealId;

  if (dealType === DEAL_TYPE.BSS_EWCS) {
    ukefDealIdFromDeal = details.ukefDealId;
  }

  return {
    recipientName: `${firstname} ${surname}`,
    ukefFacilityId,
    exporterName: exporter.companyName,
    bankReferenceNumber: bankInternalRefName,
    ukefDealId: ukefDealIdFromDeal,
  };
};

module.exports = { automaticAmendmentEmailVariables };
