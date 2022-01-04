const mapGefDealDetails = (dealSnapshot) => ({
  ukefDealId: dealSnapshot.ukefDealId,
  bankInternalRefName: dealSnapshot.bankInternalRefName,
  additionalRefName: dealSnapshot.additionalRefName,
});

module.exports = mapGefDealDetails;
