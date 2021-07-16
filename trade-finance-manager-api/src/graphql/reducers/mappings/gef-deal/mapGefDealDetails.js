const mapGefDealDetails = (dealSnapshot) => ({
  ukefDealId: 'UKEF-ID-TODO',
  bankSupplyContractID: dealSnapshot.bankInternalRefName,
  bankSupplyContractName: dealSnapshot.additionalRefName,
  // submissionType
  // owningBank: {
  //   name
  // }
  // submissionDate
  // maker: {
  //   firstname
  //   surname
  //   email
  // }
});

module.exports = mapGefDealDetails;
