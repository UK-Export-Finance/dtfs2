import { TfmDeal } from '@ukef/dtfs2-common';
import { PartyUrns } from '../../types';

type MapPartyUrnsParams = {
  deal: TfmDeal;
  isBssEwcsDeal: boolean;
  isGefDeal: boolean;
};

/**
 * Map Party URNs for a given deal, based on the deal type.
 * @param {MapPartyUrnsParams} params - Parameters used to determine the party URNs.
 * @param {TfmDeal} params.deal - The TFM deal to get the party URNs from.
 * @param {boolean} params.isBssEwcsDeal - If the deal is a BSS deal.
 * @param {boolean} params.isGefDeal - If the deal is a GEF deal.
 * @returns {PartyUrns} Party URNs for the given deal.
 * @remarks
 * For BSS/EWCS deals:
 * - GIFT's "bond giver" is the "bank party URN" from the deal snapshot.
 * - GIFT's "bond beneficiary" is the "buyer party URN" from TFM parties (if it exists).
 * For GEF deals:
 * - GIFT's "issuing bank" is the "bank party URN" from the deal snapshot.
 */
export const mapPartyUrns = ({ deal, isBssEwcsDeal, isGefDeal }: MapPartyUrnsParams): PartyUrns => {
  const bankPartyUrn = String(deal.dealSnapshot.bank.partyUrn);
  const buyerPartyUrn = String(deal.tfm.parties.buyer?.partyUrn);

  if (isBssEwcsDeal) {
    return {
      ...(buyerPartyUrn && { bondBeneficiary: String(buyerPartyUrn) }),
      bondGiver: bankPartyUrn,
    };
  }

  if (isGefDeal) {
    return {
      issuingBank: bankPartyUrn,
    };
  }

  return {};
};
