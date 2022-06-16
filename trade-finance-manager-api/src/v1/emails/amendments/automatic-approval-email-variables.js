const automaticAmendmentEmailVariables = (amendmentVariables) => {
  const { amendment, deal, user } = amendmentVariables;
  const { ukefFacilityId } = amendment;
  const { exporter, ukefDealId, bankInternalRefName } = deal;
  const { firstname, surname } = user;

  return {
    recipientName: `${firstname} ${surname}`,
    ukefFacilityId,
    exporterName: exporter.companyName,
    bankReferenceNumber: bankInternalRefName,
    ukefDealId,
  };
};

module.exports = { automaticAmendmentEmailVariables };
