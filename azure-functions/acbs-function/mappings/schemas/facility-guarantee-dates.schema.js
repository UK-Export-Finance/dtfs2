import { z } from 'zod';
import { GuaranteeExpiryDateSchema } from './guarantee-expiry-date.schema';

export const FacilityGuaranteeDatesSchema = z.object({
  guaranteeExpiryDate: GuaranteeExpiryDateSchema,
});
