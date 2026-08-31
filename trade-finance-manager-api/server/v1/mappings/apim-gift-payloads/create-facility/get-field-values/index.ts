import { Currency, getTfmUkefDealId, TfmDeal, TfmFacility } from '@ukef/dtfs2-common';
import { APIM_GIFT_INTEGRATION } from '../../constants';
import { getBssSubtypeName } from '../get-bss-subtype-name';
import { getEwcsSupplierType } from '../get-ewcs-supplier-type';
import { getFacilityTypeFlags } from '../get-facility-type-flags';
import { getGuaranteeFeePayableToUkef } from '../get-guarantee-fee-payable-to-ukef';
import { getIndustryCode } from '../../get-industry-code';
import { mapCoverPercentage } from '../map-cover-percentage';
import { mapFacilityAmount } from '../map-overview/map-facility-amount';
import { mapPartyUrns } from '../map-party-urns';
import { mapProductTypeCode } from '../map-product-type-code';
import { ApimGiftConsumerType, ApimGiftProductTypeCode, PartyUrns } from '../../types';

type GetFieldValuesParams = {
  deal: TfmDeal;
  facility: TfmFacility;
};

type GetFieldValuesReturn = {
  bssSubtypeName: string | undefined;
  consumer: ApimGiftConsumerType;
  currency: Currency;
  dayCountBasis: number;
  dealId: string | null;
  effectiveDate: string;
  ewcsSupplierType: string | null;
  expiryDate: string;
  exporterCreditRating: string;
  facilityAmount: number | null;
  facilityFlags: {
    isBssFacility: boolean;
    isCashFacility: boolean;
    isContingentFacility: boolean;
    isEwcsFacility: boolean;
  };
  facilityType: string;
  feeFrequency: string;
  feeType: string;
  guaranteeFeePayableToUkef: string | null;
  industryCode: string;
  monthsOfCover: number;
  partyUrns: PartyUrns;
  productTypeCode: ApimGiftProductTypeCode;
};

/**
 * Obtain deal and facility data required for APIM for GIFT facility creation data mapping.
 * @param params - Data required to extract field values.
 * @param {TfmDeal} params.deal - Deal data, required for mapping certain facility values.
 * @param {TfmFacility} params.facility - The TFM facility data containing `facilitySnapshot` and `tfm` values.
 * @returns {GetFieldValuesReturn} The extracted field values from a deal and facility.
 */
export const getFieldValues = ({ deal, facility }: GetFieldValuesParams): GetFieldValuesReturn => {
  const { facilitySnapshot, tfm } = facility;
  const { facilityGuaranteeDates } = tfm;

  const consumer = APIM_GIFT_INTEGRATION.CONSUMER;

  const currency = facilitySnapshot.currency.id;
  const dayCountBasis = Number(facilitySnapshot.dayCountBasis); // GEF stores this as a number. BSS/EWCS stores this as a string.
  const effectiveDate = String(facilityGuaranteeDates?.guaranteeCommencementDate);
  const expiryDate = String(facilityGuaranteeDates?.guaranteeExpiryDate);
  const monthsOfCover = Number(tfm.exposurePeriodInMonths);

  let ewcsSupplierType = null;

  const { exporterCreditRating } = deal.tfm;
  const { feeFrequency, feeType } = facilitySnapshot;
  const { type: facilityType } = facilitySnapshot;

  const dealId = getTfmUkefDealId(deal);
  const industryCode = getIndustryCode(deal);

  const facilityFlags = getFacilityTypeFlags(facilityType);
  const { isBssFacility } = facilityFlags;

  const bssSubtypeName = getBssSubtypeName({ facilitySnapshot, isBssFacility });

  const coverPercentage = mapCoverPercentage({ facilitySnapshot, ...facilityFlags });

  const facilityAmount = mapFacilityAmount({
    facilityAmount: facilitySnapshot.value,
    coverPercentage,
  });

  const guaranteeFeePayableToUkef = getGuaranteeFeePayableToUkef({ facilitySnapshot, ...facilityFlags });

  const productTypeCode = mapProductTypeCode(facilityFlags);

  const partyUrns = mapPartyUrns({ deal, ...facilityFlags });

  if (facilityFlags.isEwcsFacility) {
    ewcsSupplierType = getEwcsSupplierType(deal);
  }

  return {
    bssSubtypeName,
    consumer,
    currency,
    dayCountBasis,
    dealId,
    effectiveDate,
    ewcsSupplierType,
    expiryDate,
    exporterCreditRating,
    facilityAmount,
    facilityFlags,
    feeFrequency,
    feeType,
    facilityType,
    guaranteeFeePayableToUkef,
    industryCode,
    monthsOfCover,
    partyUrns,
    productTypeCode,
  };
};
