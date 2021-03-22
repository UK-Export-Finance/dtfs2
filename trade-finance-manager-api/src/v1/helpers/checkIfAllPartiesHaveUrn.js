const allPartiesHaveUrn = (parties) =>
  Object.values(parties).every(({ partyUrn, partyUrnRequired }) => !partyUrnRequired || (partyUrnRequired && partyUrn));

module.exports = allPartiesHaveUrn;
