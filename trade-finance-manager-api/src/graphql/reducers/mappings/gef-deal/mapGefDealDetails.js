const mapGefDealDetails = (dealSnapshot) => ({
  ukefDealId: dealSnapshot.ukefDealId,
  bankInternalRefName: dealSnapshot.bankInternalRefName,
  additionalRefName: dealSnapshot.additionalRefName,
  owningBank: {
    name: dealSnapshot.bank.name,
    emails: dealSnapshot.bank.emails,
    partyUrn: dealSnapshot.bank.partyUrn,
  },
});

module.exports = mapGefDealDetails;
