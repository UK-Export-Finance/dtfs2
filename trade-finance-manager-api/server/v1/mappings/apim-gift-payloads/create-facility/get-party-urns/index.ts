import { DEAL_TYPE, TfmDeal } from '@ukef/dtfs2-common';
import { PartyUrns } from '../../types';

/**
 * Get Party URNs for a given deal, based on the deal type.
 * @param {TfmDeal} deal - The TFM deal to get the party URNs from.
 * @returns {PartyUrns} Party URNs for the given deal.
 * @remarks
 * For BSS/EWCS deals:
 * - GIFT's "bond giver" is the "bank party URN" from the deal snapshot.
 * - GIFT's "bond beneficiary" is the "buyer party URN" from TFM parties (if it exists).
 * For GEF deals:
 * - GIFT's "issuing bank" is the "bank party URN" from the deal snapshot.
 */
export const getPartyUrns = (deal: TfmDeal): PartyUrns => {
  const { dealSnapshot, tfm } = deal;
  const { dealType } = dealSnapshot;

  switch (dealType) {
    case DEAL_TYPE.BSS_EWCS:
      return {
        bondBeneficiary: tfm.parties.buyer?.partyUrn,
        bondGiver: dealSnapshot.details.bank.partyUrn,
      };

    case DEAL_TYPE.GEF:
      return {
        issuingBank: dealSnapshot.bank.partyUrn,
      };

    default:
      return {};
  }
};
