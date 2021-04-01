const CONSTANTS = require('../../../constants');

const getGuarantorParty = ({ dealAcbsData, facilityAcbsData }, guaranteeTypeCode) => {
  switch (guaranteeTypeCode) {
    case CONSTANTS.FACILITY.GUARANTEE_TYPE.BOND_BENEFICIARY:
      return facilityAcbsData.parties.bondBeneficiary
        ? facilityAcbsData.parties.bondBeneficiary.partyIdentifier
        : dealAcbsData.parties.buyer.partyIdentifier;

    case CONSTANTS.FACILITY.GUARANTEE_TYPE.BOND_GIVER:
      return facilityAcbsData.parties.bondIssuer
        ? facilityAcbsData.parties.bondIssuer.partyIdentifier
        : dealAcbsData.parties.bank.partyIdentifier;

    case CONSTANTS.FACILITY.GUARANTEE_TYPE.FACILITY_PROVIDER:
      return dealAcbsData.parties.bank.partyIdentifier;

    case CONSTANTS.FACILITY.GUARANTEE_TYPE.BUYER_FOR_EXPORTER_EWCS:
      return dealAcbsData.parties.buyer.partyIdentifier;

    default:
      return '';
  }
};

module.exports = getGuarantorParty;
