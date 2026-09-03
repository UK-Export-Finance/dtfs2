import { TfmDeal } from '@ukef/dtfs2-common';

/**
 * Retrieves flags indicating the presence of URNs for different parties in the deal.
 *
 * @param {TfmDeal} deal - The TFM deal object to evaluate.
 * @returns An object containing flags indicating the presence of URNs for different parties in the deal.
 */
export const getUrnFlags = (deal: TfmDeal) => {
  const hasBankUrn = Boolean(deal.dealSnapshot?.bank?.partyUrn?.trim());
  const hasBuyerPartyUrn = Boolean(deal.tfm?.parties?.buyer?.partyUrn?.trim());
  const hasExporterUrn = Boolean(deal.tfm?.parties?.exporter?.partyUrn?.trim());

  const hasBssEwcsUrns = hasBankUrn && hasBuyerPartyUrn;
  const hasGefUrns = hasBankUrn && hasExporterUrn;

  return {
    hasBssEwcsUrns,
    hasGefUrns,
  };
};
