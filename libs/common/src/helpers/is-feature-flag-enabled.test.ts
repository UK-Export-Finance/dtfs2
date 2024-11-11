import {
  isFeeRecordCorrectionFeatureFlagEnabled,
  isPortalFacilityAmendmentsFeatureFlagEnabled,
  isTfmDealCancellationFeatureFlagEnabled,
  isTfmFacilityEndDateFeatureFlagEnabled,
  isTfmPaymentReconciliationFeatureFlagEnabled,
  isTfmSsoFeatureFlagEnabled,
  isAutomaticSalesforceCustomerCreationFeatureFlagEnabled,
} from './is-feature-flag-enabled';
import { withBooleanFeatureFlagTests } from './with-boolean-feature-flag.tests';

describe('is-feature-flag-enabled helpers', () => {
  withBooleanFeatureFlagTests({ featureFlagName: 'FF_TFM_PAYMENT_RECONCILIATION_ENABLED', getFeatureFlagValue: isTfmPaymentReconciliationFeatureFlagEnabled });
  withBooleanFeatureFlagTests({ featureFlagName: 'FF_FEE_RECORD_CORRECTION_ENABLED', getFeatureFlagValue: isFeeRecordCorrectionFeatureFlagEnabled });
  withBooleanFeatureFlagTests({ featureFlagName: 'FF_TFM_FACILITY_END_DATE_ENABLED', getFeatureFlagValue: isTfmFacilityEndDateFeatureFlagEnabled });
  withBooleanFeatureFlagTests({ featureFlagName: 'FF_TFM_DEAL_CANCELLATION_ENABLED', getFeatureFlagValue: isTfmDealCancellationFeatureFlagEnabled });
  withBooleanFeatureFlagTests({ featureFlagName: 'FF_PORTAL_FACILITY_AMENDMENTS_ENABLED', getFeatureFlagValue: isPortalFacilityAmendmentsFeatureFlagEnabled });
  withBooleanFeatureFlagTests({ featureFlagName: 'FF_TFM_SSO_ENABLED', getFeatureFlagValue: isTfmSsoFeatureFlagEnabled });
  withBooleanFeatureFlagTests({ featureFlagName: 'AUTOMATIC_SALESFORCE_CUSTOMER_CREATION_ENABLED', getFeatureFlagValue: isAutomaticSalesforceCustomerCreationFeatureFlagEnabled });
});
