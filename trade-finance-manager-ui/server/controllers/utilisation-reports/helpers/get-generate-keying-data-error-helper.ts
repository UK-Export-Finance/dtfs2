import { ErrorSummaryViewModel } from '../../../types/view-models';

export type GenerateKeyingDataErrorKey = 'no-matching-fee-records';

const generateKeyingDataErrorMap: Record<GenerateKeyingDataErrorKey, ErrorSummaryViewModel> = {
  'no-matching-fee-records': {
    text: 'No matched fees to generate keying data with',
    href: '#premium-payments-table',
  },
};

export const getGenerateKeyingDataError = (generateKeyingDataErrorKey: GenerateKeyingDataErrorKey): ErrorSummaryViewModel =>
  generateKeyingDataErrorMap[generateKeyingDataErrorKey];
