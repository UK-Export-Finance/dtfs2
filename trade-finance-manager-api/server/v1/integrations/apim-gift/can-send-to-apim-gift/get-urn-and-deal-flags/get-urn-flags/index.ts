import { TfmDeal } from '@ukef/dtfs2-common';

/**
 * Retrieves flags indicating the presence of URNs for different parties in the deal.
 *
 * @param {TfmDeal} deal - The TFM deal object to evaluate.
 * @returns An object containing flags indicating the presence of URNs for different parties in the deal.
 */
export const getUrnFlags = (deal: TfmDeal) => {
  const hasBankUrn = deal.dealSnapshot.bank.partyUrn;
  const hasBuyerPartyUrn = Boolean(deal.tfm.parties.buyer?.partyUrn);
  const hasExporterUrn = deal.tfm.parties.exporter.partyUrn;

  const hasBssEwcsUrns = hasBankUrn && hasBuyerPartyUrn;
  const hasGefUrns = hasBankUrn && hasExporterUrn;

  return {
    hasBssEwcsUrns,
    hasGefUrns,
  };
};
