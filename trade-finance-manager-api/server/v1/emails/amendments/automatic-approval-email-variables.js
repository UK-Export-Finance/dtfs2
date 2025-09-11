const automaticAmendmentEmailVariables = (amendmentVariables) => {
  const { amendment, dealSnapshot, user } = amendmentVariables;
  const { ukefFacilityId } = amendment;
  const { exporter, bankInternalRefName } = dealSnapshot;
  const { firstname, surname } = user;

  const ukefDealId = dealSnapshot.ukefDealId ?? dealSnapshot.details.ukefDealId;

  return {
    recipientName: `${firstname} ${surname}`,
    ukefFacilityId,
    exporterName: exporter.companyName,
    bankReferenceNumber: bankInternalRefName,
    ukefDealId,
  };
};

module.exports = { automaticAmendmentEmailVariables };
