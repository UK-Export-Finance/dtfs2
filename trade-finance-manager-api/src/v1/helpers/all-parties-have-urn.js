const allPartiesHaveUrn = ({ dealSnapshot, tfm }) => {
  const dealPartiesHaveUrn = Object.values(tfm.parties)
    .every(({ partyUrn, partyUrnRequired }) => !partyUrnRequired || (partyUrnRequired && partyUrn));

  const facilitiesHaveUrn = dealSnapshot.facilities.every(({ facilitySnapshot, tfm: facilityTfm }) => {
    const hasRequiredIssuerUrn = !facilitySnapshot.bondIssuer || facilityTfm.bondIssuerPartyUrn;
    const hasRequiredBeneficiaryUrn = !facilitySnapshot.bondBeneficiary || facilityTfm.bondBeneficiaryPartyUrn;

    return Boolean(hasRequiredIssuerUrn && hasRequiredBeneficiaryUrn);
  });

  return dealPartiesHaveUrn && facilitiesHaveUrn;
};


module.exports = allPartiesHaveUrn;
