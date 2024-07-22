/*
  "guaranteeExpiryDate"       Facility cover end date, maps to expirationDate
  */

import { z } from 'zod';
import { mappingSchemas } from '../schemas';
import { mappingTransformations } from '../transformations';

const FacilityCovenantAmendSchema = z
  .object({
    amount: mappingSchemas.AmountSchema,
    facilityGuaranteeDates: mappingSchemas.FacilityGuaranteeDatesSchema,
  })
  .partial()
  .refine(({ amount, facilityGuaranteeDates }) => amount || facilityGuaranteeDates, 'Either amount or facilityGuaranteeDates.guaranteeExpiryDate is required.')
  .transform(({ amount, facilityGuaranteeDates }) => {
    return {
      ...mappingTransformations.amountTransformation(amount),
      ...mappingTransformations.guaranteeExpiryDateTransformation(facilityGuaranteeDates?.guaranteeExpiryDate),
    };
  });

export const facilityCovenantAmend = (amendment: unknown) => {
  return FacilityCovenantAmendSchema.parse(amendment);
};
