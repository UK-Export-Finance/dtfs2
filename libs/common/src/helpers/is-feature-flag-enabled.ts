import dotenv from 'dotenv';
import { z } from 'zod';
import { zBooleanStrictCoerce } from './schema';

dotenv.config();

const featureFlagOptions = zBooleanStrictCoerce.optional().default(false);

const featureFlagsSchema = z.object({
  /**
   * If set to false, disables all routes associated with TFM 6
   */
  FF_TFM_PAYMENT_RECONCILIATION_ENABLED: featureFlagOptions,
  FF_TFM_FACILITY_END_DATE_ENABLED: featureFlagOptions,
  FF_TFM_DEAL_CANCELLATION: featureFlagOptions,
});

export type FeatureFlag = keyof z.infer<typeof featureFlagsSchema>;

const isFeatureFlagEnabled = (featureFlag: FeatureFlag) => (): boolean => {
  const featureFlags = featureFlagsSchema.parse(process.env);
  return featureFlags[featureFlag];
};

export const isTfmPaymentReconciliationFeatureFlagEnabled = isFeatureFlagEnabled('FF_TFM_PAYMENT_RECONCILIATION_ENABLED');

export const isTfmFacilityEndDateFeatureFlagEnabled = isFeatureFlagEnabled('FF_TFM_FACILITY_END_DATE_ENABLED');
export const isTfmDealCancellationFeatureFlagEnabled = isFeatureFlagEnabled('FF_TFM_DEAL_CANCELLATION');
