import { Currency, FeeRecordStatus } from '@ukef/dtfs2-common';

export type PremiumPaymentsTableCheckboxId = `feeRecordId-${number}-reportedPaymentsCurrency-${Currency}-status-${FeeRecordStatus}`;
