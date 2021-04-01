const CONSTANTS = require('../../../constants');

const getFacilityGuaranteeLimitKey = ({ acbsData, facilityAcbsData }, guaranteeTypeCode) => {
  switch (guaranteeTypeCode) {
    case CONSTANTS.FACILITY.GUARANTEE_TYPE.BOND_BENEFICIARY:
      return facilityAcbsData.parties.bondBeneficiary
        ? facilityAcbsData.parties.bondBeneficiary.partyIdentifier
        : acbsData.parties.buyer.partyIdentifier;

    case CONSTANTS.FACILITY.GUARANTEE_TYPE.BOND_GIVER:
      return facilityAcbsData.parties.bondIssuer
        ? facilityAcbsData.parties.bondIssuer.partyIdentifier
        : acbsData.parties.bank.partyIdentifier;

    case CONSTANTS.FACILITY.GUARANTEE_TYPE.FACILITY_PROVIDER:
      return acbsData.parties.indemnifier.partyIdentifier || acbsData.parties.exporter.partyIdentifier;

    case CONSTANTS.FACILITY.GUARANTEE_TYPE.BUYER_FOR_EXPORTER_EWCS:
      return '';

    default:
      return '';
  }
};

module.exports = getFacilityGuaranteeLimitKey;
