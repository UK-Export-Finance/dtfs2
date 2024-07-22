import { z } from 'zod';
import { mappingSchemas } from '../schemas';
import { mappingTransformations } from '../transformations';

const FacilityGuaranteeAmendSchema = z
  .object({
    facilityGuaranteeDates: mappingSchemas.FacilityGuaranteeDatesSchema,
    amount: mappingSchemas.AmountSchema,
  })
  .partial()
  .refine(({ amount, facilityGuaranteeDates }) => amount || facilityGuaranteeDates, 'Either amount or facilityGuaranteeDates.guaranteeExpiryDate is required.')
  .transform(({ amount, facilityGuaranteeDates }) => {
    return {
      ...mappingTransformations.guaranteeExpiryDateTransformation(facilityGuaranteeDates?.guaranteeExpiryDate),
      ...mappingTransformations.amountTransformationToGuaranteedLimit(amount), // This is assumed based on maximumLiability
    };
  });

export const facilityGuaranteeAmend = (amendment: unknown) => {
  try {
    return FacilityGuaranteeAmendSchema.parse(amendment);
  } catch (error) {
    console.error('Unable to map facility guarantee amendment. %o', error);
    return {};
  }
};
