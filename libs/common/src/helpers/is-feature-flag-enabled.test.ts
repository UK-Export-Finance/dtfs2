import {
  isFeeRecordCorrectionFeatureFlagEnabled,
  isPortalFacilityAmendmentsFeatureFlagEnabled,
  isTfmDealCancellationFeatureFlagEnabled,
  isTfmSsoFeatureFlagEnabled,
  isSalesforceCustomerCreationEnabled,
} from './is-feature-flag-enabled';
import { withBooleanFeatureFlagTests } from './with-boolean-feature-flag.tests';

describe('is-feature-flag-enabled helpers', () => {
  withBooleanFeatureFlagTests({ featureFlagName: 'FF_FEE_RECORD_CORRECTION_ENABLED', getFeatureFlagValue: isFeeRecordCorrectionFeatureFlagEnabled });
  withBooleanFeatureFlagTests({ featureFlagName: 'FF_TFM_DEAL_CANCELLATION_ENABLED', getFeatureFlagValue: isTfmDealCancellationFeatureFlagEnabled });
  withBooleanFeatureFlagTests({ featureFlagName: 'FF_PORTAL_FACILITY_AMENDMENTS_ENABLED', getFeatureFlagValue: isPortalFacilityAmendmentsFeatureFlagEnabled });
  withBooleanFeatureFlagTests({ featureFlagName: 'FF_TFM_SSO_ENABLED', getFeatureFlagValue: isTfmSsoFeatureFlagEnabled });
  withBooleanFeatureFlagTests({ featureFlagName: 'FF_SALESFORCE_CUSTOMER_CREATION_ENABLED', getFeatureFlagValue: isSalesforceCustomerCreationEnabled });
});
