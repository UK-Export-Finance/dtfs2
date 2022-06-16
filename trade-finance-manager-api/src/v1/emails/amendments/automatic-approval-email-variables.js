const automaticAmendmentEmailVariables = (amendmentVariables) => {
  const { amendment, dealSnapshot, user } = amendmentVariables;
  const { ukefFacilityId } = amendment;
  const { exporter, ukefDealId, bankInternalRefName } = dealSnapshot;
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
