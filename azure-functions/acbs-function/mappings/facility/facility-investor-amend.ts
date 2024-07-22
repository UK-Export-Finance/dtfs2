import { z } from 'zod';
import { mappingSchemas } from '../schemas';
import { mappingTransformations } from '../transformations';
// TODO UPDATE
const FacilityInvestorAmendSchema = z
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

export const facilityInvestorAmend = (amendment: unknown) => {
  try {
    return FacilityInvestorAmendSchema.parse(amendment);
  } catch (error) {
    console.error('Unable to map facility covenant record. %o', error);
    return {};
  }
};
