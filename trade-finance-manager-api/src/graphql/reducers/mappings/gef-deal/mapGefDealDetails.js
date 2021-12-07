const mapGefDealDetails = (dealSnapshot) => ({
  ukefDealId: dealSnapshot.ukefDealId,
  bankSupplyContractID: dealSnapshot.bankInternalRefName,
  bankSupplyContractName: dealSnapshot.additionalRefName,
  submissionType: dealSnapshot.submissionType,
  dateOfLastAction: dealSnapshot.updatedAt,
  owningBank: {
    name: dealSnapshot.bank.name,
    emails: dealSnapshot.bank.emails,
    partyUrn: dealSnapshot.bank.partyUrn,
  },
});

module.exports = mapGefDealDetails;
