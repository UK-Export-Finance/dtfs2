import { APIM_GIFT_INTEGRATION } from '../../constants';

type MapOverviewParams = {
  facilityAmount: string;
  facilityName: string;
  currency: string;
  effectiveDate: string;
  expiryDate: string;
  exporterPartyUrn: string;
  productTypeCode: string;
  ukefFacilityId: string;
};

type OverviewReturnType = {
  creditType: string;
  currency: string;
  effectiveDate: string;
  expiryDate: string;
  facilityAmount: string;
  facilityId: string;
  facilityName: string;
  isRevolving: boolean;
  obligorUrn: string;
  productTypeCode: string; // TODO: DTFS2-8307 - typing
};

export const mapOverview = ({
  currency,
  effectiveDate,
  expiryDate,
  exporterPartyUrn,
  facilityAmount,
  facilityName,
  productTypeCode,
  ukefFacilityId,
}: MapOverviewParams): OverviewReturnType => ({
  creditType: APIM_GIFT_INTEGRATION.DEFAULTS.OVERVIEW.CREDIT_TYPE.BSS, // TODO: DTFS2-8307 - based on product type
  currency,
  facilityAmount,
  facilityId: ukefFacilityId,
  facilityName,
  effectiveDate,
  expiryDate,
  isRevolving: APIM_GIFT_INTEGRATION.DEFAULTS.OVERVIEW.IS_REVOLVING.BSS, // TODO: DTFS2-8308 - based on product type
  obligorUrn: exporterPartyUrn,
  productTypeCode,
});
