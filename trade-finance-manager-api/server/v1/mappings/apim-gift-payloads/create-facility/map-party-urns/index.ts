import { TfmDeal } from '@ukef/dtfs2-common';
import { PartyUrns } from '../../types';

type MapPartyUrnsParams = {
  deal: TfmDeal;
  isBssFacility: boolean;
  isEwcsFacility: boolean;
  isCashFacility: boolean;
  isContingentFacility: boolean;
};

/**
 * Map Party URNs for a given facility/deal, based on the facility type.
 * @param {MapPartyUrnsParams} params - Parameters used to determine the party URNs.
 * @param {TfmDeal} params.deal - The TFM deal to get the party URNs from.
 * @param {boolean} params.isBssFacility - If the facility is a BSS facility.
 * @param {boolean} params.isCashFacility - If the facility is a Cash facility.
 * @param {boolean} params.isContingentFacility - If the facility is a Contingent facility.
 * @param {boolean} params.isEwcsFacility - If the facility is an EWCS facility.
 * @returns {PartyUrns} Party URNs for a facility/deal.
 * @remarks
 * For a BSS facility:
 * - GIFT's "bond beneficiary" is the "buyer party URN" from TFM parties (if it exists).
 * - GIFT's "bond giver" is the "bank party URN" from the deal snapshot.
 * For an EWCS facility:
 * - GIFT's "buyer" is the "buyer party URN" from TFM parties (if it exists).
 * - GIFT's "issuing bank" is the "bank party URN" from the deal snapshot.
 * For a Cash or Contingent facility:
 * - GIFT's "issuing bank" is the "bank party URN" from the deal snapshot.
 * - GIFT's "exporter" is the "exporter party URN" from TFM parties.
 */
export const mapPartyUrns = ({ deal, isBssFacility, isCashFacility, isContingentFacility, isEwcsFacility }: MapPartyUrnsParams): PartyUrns => {
  const bankPartyUrn = String(deal.dealSnapshot.bank.partyUrn);
  const buyerPartyUrn = deal.tfm.parties.buyer?.partyUrn;
  const exporterPartyUrn = deal.tfm.parties.exporter.partyUrn;

  if (isBssFacility) {
    const bondBeneficiary = buyerPartyUrn != null && { bondBeneficiary: String(buyerPartyUrn) };

    const partyUrns = {
      ...bondBeneficiary,
      bondGiver: bankPartyUrn,
      exporterPartyUrn,
    };

    return partyUrns;
  }

  if (isEwcsFacility) {
    return {
      buyer: buyerPartyUrn,
      issuingBank: bankPartyUrn,
    };
  }

  if (isCashFacility || isContingentFacility) {
    const partyUrns = {
      issuingBank: bankPartyUrn,
      exporterPartyUrn,
    };

    return partyUrns;
  }

  return {
    exporterPartyUrn,
  };
};
