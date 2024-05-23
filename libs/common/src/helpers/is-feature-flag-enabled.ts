import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const featureFlagOptions = z
  .union([z.literal('true'), z.literal('false')])
  .default('false')
  .transform((featureFlag) => featureFlag === 'true');

const featureFlagsSchema = z.object({
  /**
   * If set to false, disables all routes associated with TFM 6
   */
  FF_TFM_PAYMENT_RECONCILIATION_ENABLED: featureFlagOptions,
  FF_USE_2FA_AUTHENTICATION_CODE: featureFlagOptions,
});

export type FeatureFlag = keyof z.infer<typeof featureFlagsSchema>;

const isFeatureFlagEnabled = (featureFlag: FeatureFlag) => (): boolean => {
  const featureFlags = featureFlagsSchema.parse(process.env);
  return featureFlags[featureFlag];
};

export const isTfmPaymentReconciliationFeatureFlagEnabled = isFeatureFlagEnabled('FF_TFM_PAYMENT_RECONCILIATION_ENABLED');
export const is2faAuthenticationCodeFeatureFlagEnabled = isFeatureFlagEnabled('FF_USE_2FA_AUTHENTICATION_CODE');
