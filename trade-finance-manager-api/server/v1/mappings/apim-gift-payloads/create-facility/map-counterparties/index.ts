import { DEAL_TYPE, DealType } from '@ukef/dtfs2-common';
import { APIM_GIFT_INTEGRATION } from '../../constants';
import { ApimGiftCounterparty, PartyUrns } from '../../types';

const { DEFAULTS } = APIM_GIFT_INTEGRATION;

type MapCounterpartiesParams = {
  dealType: DealType;
  partyUrns: PartyUrns;
  startDate: string;
  exitDate: string;
};

/**
 * Maps the counterparties for a given deal type and party URNs.
 * @param {MapCounterpartiesParams} params - Data required to build the APIM GIFT "counterparties" data.
 * @param {DealType} params.dealType - The type of deal.
 * @param {PartyUrns} params.partyUrns - The party URNs.
 * @param {string} params.startDate - The start date of the facility (from TFM "facilityGuaranteeDates").
 * @param {string} params.exitDate - The exit date of the facility (from TFM "facilityGuaranteeDates").
 * @returns {ApimGiftCounterparty[]} Mapped counterparties array for the APIM GIFT payload.
 */
export const mapCounterparties = ({ dealType, partyUrns, startDate, exitDate }: MapCounterpartiesParams): ApimGiftCounterparty[] => {
  if (dealType === DEAL_TYPE.BSS_EWCS) {
    const counterparties: ApimGiftCounterparty[] = [];

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

  return [];
};
