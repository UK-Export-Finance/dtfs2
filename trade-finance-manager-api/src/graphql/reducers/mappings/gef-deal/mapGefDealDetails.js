const mapGefDealDetails = (dealSnapshot) => ({
  ukefDealId: dealSnapshot.ukefDealId,
  bankSupplyContractID: dealSnapshot.bankInternalRefName,
  bankSupplyContractName: dealSnapshot.additionalRefName,
  dateOfLastAction: dealSnapshot.updatedAt,
  owningBank: {
    name: dealSnapshot.bank.name,
    emails: dealSnapshot.bank.emails,
    partyUrn: dealSnapshot.bank.partyUrn,
  },
});

module.exports = mapGefDealDetails;
