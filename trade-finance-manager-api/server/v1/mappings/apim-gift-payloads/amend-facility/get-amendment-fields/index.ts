import { getFormattedUTCDateString } from '@ukef/dtfs2-common';
import { TfmFacilityAmendmentData } from '../../types';

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
  const newAmount = Number(amendment.value);
  const previousAmount = Number(amendment.currentValue);

  const coverEndDate =
    amendment?.tfm?.coverEndDate !== undefined && amendment.tfm.coverEndDate !== null ? getFormattedUTCDateString(Number(amendment.tfm.coverEndDate)) : '';

  const effectiveDate =
    amendment.effectiveDate !== undefined && amendment.effectiveDate !== null ? getFormattedUTCDateString(Number(amendment.effectiveDate)) : '';

  return {
    newAmount,
    previousAmount,
    coverEndDate,
    effectiveDate,
  };
};
