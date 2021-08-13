const mapGefDealDetails = (dealSnapshot) => ({
  ukefDealId: dealSnapshot.ukefDealId,
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
