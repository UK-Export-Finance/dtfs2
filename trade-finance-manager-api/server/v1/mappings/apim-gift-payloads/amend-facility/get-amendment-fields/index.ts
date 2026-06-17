import { getFormattedDateStringInTimeZone, getFormattedUTCDateString } from '@ukef/dtfs2-common';
import { TfmFacilityAmendmentData } from '../../types';

const LONDON_TIME_ZONE = 'Europe/London';

type AmendmentFields = {
  newAmount: number;
  previousAmount: number;
  coverEndDate: string;
  effectiveDate: string;
};

/**
 * Extracts amendment values from TFM amendment data.
 * @param {TfmFacilityAmendmentData} amendment - The facility amendment data from TFM.
 * @returns {AmendmentFields} An object containing amount, cover end date and effective date values for APIM/GIFT payload construction.
 */
export const getAmendmentFields = (amendment: TfmFacilityAmendmentData): AmendmentFields => {
  const newAmount = typeof amendment.value === 'number' ? amendment.value : Number.NaN;
  const previousAmount = typeof amendment.currentValue === 'number' ? amendment.currentValue : Number.NaN;

  const hasCoverEndDate = amendment?.tfm?.coverEndDate !== undefined && amendment.tfm.coverEndDate !== null;

  const coverEndDate = hasCoverEndDate ? getFormattedDateStringInTimeZone(Number(amendment.tfm?.coverEndDate), LONDON_TIME_ZONE) : '';

  const hasEffectiveDate = amendment.effectiveDate !== undefined && amendment.effectiveDate !== null;

  const effectiveDate = hasEffectiveDate ? getFormattedUTCDateString(Number(amendment.effectiveDate)) : '';

  return {
    newAmount,
    previousAmount,
    coverEndDate,
    effectiveDate,
  };
};
