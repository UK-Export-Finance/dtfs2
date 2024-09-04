import {
  isTfmDealCancellationFeatureFlagEnabled,
  isTfmFacilityEndDateFeatureFlagEnabled,
  isTfmPaymentReconciliationFeatureFlagEnabled,
} from './is-feature-flag-enabled';
import { withBooleanFeatureFlagTests } from './with-boolean-feature-flag.tests';

describe('is-feature-flag-enabled helpers', () => {
  withBooleanFeatureFlagTests({ featureFlagName: 'FF_TFM_PAYMENT_RECONCILIATION_ENABLED', getFeatureFlagValue: isTfmPaymentReconciliationFeatureFlagEnabled });
  withBooleanFeatureFlagTests({ featureFlagName: 'FF_TFM_FACILITY_END_DATE_ENABLED', getFeatureFlagValue: isTfmFacilityEndDateFeatureFlagEnabled });
  withBooleanFeatureFlagTests({ featureFlagName: 'FF_TFM_DEAL_CANCELLATION', getFeatureFlagValue: isTfmDealCancellationFeatureFlagEnabled });
});
