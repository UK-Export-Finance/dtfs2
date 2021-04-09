const CONSTANTS = require('../../../constants');

const getGuarantorParty = ({ acbsData, facilityAcbsData }, guaranteeTypeCode) => {
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
      return acbsData.parties.bank.partyIdentifier;

    case CONSTANTS.FACILITY.GUARANTEE_TYPE.BUYER_FOR_EXPORTER_EWCS:
      return acbsData.parties.buyer.partyIdentifier;

    default:
      return '';
  }
};

module.exports = getGuarantorParty;
