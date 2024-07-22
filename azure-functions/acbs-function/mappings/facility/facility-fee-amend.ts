import { z } from 'zod';

const FacilityFeeAmendSchema = z
  .object({
    // TO UPDATE
  })
  .partial()
  .refine(
    (
      // eslint-disable-next-line no-empty-pattern
      {
        // TO UPDATE
      },
    ) => {
      return {};
    }, // TO UPDATE
    'Either X or Y is required.',
  ) // TO UPDATE
  .transform(
    (
      // eslint-disable-next-line no-empty-pattern
      {
        // TO UPDATE
      },
    ) => {
      return {
        // TO UPDATE
      };
    },
  );

export const facilityFeeAmend = (amendment: unknown) => {
  try {
    return FacilityFeeAmendSchema.parse(amendment);
  } catch (error) {
    console.error('Unable to map facility fee record. %o', error);
    return {};
  }
};
