const automaticAmendmentEmailVariables = (amendmentVariables) => {
  const { amendment, dealSnapshot, user } = amendmentVariables;
  const { ukefFacilityId } = amendment;
  const { exporter, bankInternalRefName } = dealSnapshot;
  const { firstname, lastName } = user;

  const ukefDealId = dealSnapshot.ukefDealId ?? dealSnapshot.details.ukefDealId;

  return {
    recipientName: `${firstname} ${lastName}`,
    ukefFacilityId,
    exporterName: exporter.companyName,
    bankReferenceNumber: bankInternalRefName,
    ukefDealId,
  };
};

module.exports = { automaticAmendmentEmailVariables };
