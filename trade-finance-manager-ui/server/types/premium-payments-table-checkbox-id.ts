import { Currency, FeeRecordStatus } from '@ukef/dtfs2-common';

export type PremiumPaymentsTableCheckboxId = `feeRecordIds-${string}-reportedPaymentsCurrency-${Currency}-status-${FeeRecordStatus}`;
