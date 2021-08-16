const mapGefDealDetails = (dealSnapshot) => ({
  ukefDealId: dealSnapshot.ukefDealId,
  bankSupplyContractID: dealSnapshot.bankInternalRefName,
  bankSupplyContractName: dealSnapshot.additionalRefName,
  submissionType: dealSnapshot.submissionType,
  // owningBank: {
  //   name
  // }
});

module.exports = mapGefDealDetails;
