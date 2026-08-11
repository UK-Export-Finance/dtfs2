import { APIM_GIFT_INTEGRATION } from '../../constants';
import { ApimGiftCounterparty, PartyUrns } from '../../types';

const { DEFAULTS } = APIM_GIFT_INTEGRATION;

type MapCounterpartiesParams = {
  isBssFacility: boolean;
  isCashFacility: boolean;
  isContingentFacility: boolean;
  partyUrns: PartyUrns;
};

/**
 * Maps the counterparties depending on the type of facility and party URNs.
 * BSS - If available, create a "Bond giver" counterparty (from the bank party URN) and a "Bond beneficiary" counterparty (from the buyer party URN).
 * Cash, Contingent - If available, create an "Issuing bank" counterparty (from the bank party URN).
 * @param {MapCounterpartiesParams} params - Data required to build the APIM GIFT "counterparties" data.
 * @param {boolean} params.isBssFacility - If the facility is a BSS facility.
 * @param {boolean} params.isCashFacility - If the facility is a Cash facility.
 * @param {boolean} params.isContingentFacility - If the facility is a Contingent facility.
 * @param {PartyUrns} params.partyUrns - The party URNs.
 * @returns {ApimGiftCounterparty[]} Mapped counterparties array for the APIM GIFT payload.
 */

export const mapCounterparties = ({ isBssFacility, isCashFacility, isContingentFacility, partyUrns }: MapCounterpartiesParams): ApimGiftCounterparty[] => {
  const counterparties: ApimGiftCounterparty[] = [];

  if (isBssFacility) {
    if (partyUrns.bondGiver) {
      counterparties.push({
        counterpartyUrn: partyUrns.bondGiver,
        roleCode: DEFAULTS.COUNTERPARTY_ROLE_CODE.BSS.BOND_GIVER,
      });
    }

    if (partyUrns.bondBeneficiary) {
      counterparties.push({
        counterpartyUrn: partyUrns.bondBeneficiary,
        roleCode: DEFAULTS.COUNTERPARTY_ROLE_CODE.BSS.BOND_BENEFICIARY,
      });
    }

    return counterparties;
  }

  if ((isCashFacility || isContingentFacility) && partyUrns.issuingBank) {
    counterparties.push({
      counterpartyUrn: partyUrns.issuingBank,
      roleCode: DEFAULTS.COUNTERPARTY_ROLE_CODE.GEF.ISSUING_BANK,
    });

    return counterparties;
  }

  return [];
};
