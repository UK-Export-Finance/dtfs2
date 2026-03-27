import { APIM_GIFT_INTEGRATION } from '../../constants';
import { ApimGiftCounterparty, PartyUrns } from '../../types';

const { DEFAULTS } = APIM_GIFT_INTEGRATION;

type MapCounterpartiesParams = {
  isBssEwcsDeal: boolean;
  isGefDeal: boolean;
  partyUrns: PartyUrns;
  startDate: string;
  exitDate: string;
};

/**
 * Maps the counterparties for a given deal type and party URNs.
 * BSS/EWCS - If available, create a "Bond giver" counterparty (from the bank party URN) and a "Bond beneficiary" counterparty (from the buyer party URN).
 * GEF - If available, create an "Issuing bank" counterparty (from the bank party URN).
 * @param {MapCounterpartiesParams} params - Data required to build the APIM GIFT "counterparties" data.
 * @param {boolean} params.isBssEwcsDeal - If the deal is a BSS/EWCS deal.
 * @param {boolean} params.isGefDeal - If the deal is a GEF deal.
 * @param {PartyUrns} params.partyUrns - The party URNs.
 * @param {string} params.startDate - The start date of the facility (from TFM "facilityGuaranteeDates").
 * @param {string} params.exitDate - The exit date of the facility (from TFM "facilityGuaranteeDates").
 * @returns {ApimGiftCounterparty[]} Mapped counterparties array for the APIM GIFT payload.
 */
export const mapCounterparties = ({ isBssEwcsDeal, isGefDeal, partyUrns, startDate, exitDate }: MapCounterpartiesParams): ApimGiftCounterparty[] => {
  const counterparties: ApimGiftCounterparty[] = [];

  if (isBssEwcsDeal) {
    if (partyUrns.bondGiver) {
      counterparties.push({
        counterpartyUrn: partyUrns.bondGiver,
        startDate,
        exitDate,
        roleCode: DEFAULTS.COUNTERPARTY_ROLE_CODE.BSS.BOND_GIVER,
      });
    }

    if (partyUrns.bondBeneficiary) {
      counterparties.push({
        counterpartyUrn: partyUrns.bondBeneficiary,
        startDate,
        exitDate,
        roleCode: DEFAULTS.COUNTERPARTY_ROLE_CODE.BSS.BOND_BENEFICIARY,
      });
    }

    return counterparties;
  }

  if (isGefDeal && partyUrns.issuingBank) {
    counterparties.push({
      counterpartyUrn: partyUrns.issuingBank,
      startDate,
      exitDate,
      roleCode: DEFAULTS.COUNTERPARTY_ROLE_CODE.GEF.ISSUING_BANK,
    });

    return counterparties;
  }

  return [];
};
