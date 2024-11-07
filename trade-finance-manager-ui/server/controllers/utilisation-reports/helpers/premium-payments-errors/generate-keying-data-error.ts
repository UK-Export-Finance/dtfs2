import { PREMIUM_PAYMENTS_TABLE_ERROR_HREF } from '../../../../constants/premium-payments-table-href';
import { GENERATE_KEYING_DATA_ERROR_KEY } from '../../../../constants/premium-payment-tab-error-keys';
import { GenerateKeyingDataErrorKey } from '../../../../types/premium-payments-tab-error-keys';
import { ErrorSummaryViewModel } from '../../../../types/view-models';

const { NO_MATCHING_FEE_RECORDS } = GENERATE_KEYING_DATA_ERROR_KEY;

const generateKeyingDataErrorMap: Record<GenerateKeyingDataErrorKey, ErrorSummaryViewModel> = {
  [NO_MATCHING_FEE_RECORDS]: {
    text: 'No matched fees to generate keying data with',
    href: PREMIUM_PAYMENTS_TABLE_ERROR_HREF,
  },
};

export const getGenerateKeyingDataError = (generateKeyingDataErrorKey: GenerateKeyingDataErrorKey): ErrorSummaryViewModel =>
  generateKeyingDataErrorMap[generateKeyingDataErrorKey];

export const validateGenerateKeyingDataErrorKey = (generateKeyingDataErrorKey: string): generateKeyingDataErrorKey is GenerateKeyingDataErrorKey => {
  const allKeys: string[] = Object.values(GENERATE_KEYING_DATA_ERROR_KEY);
  if (allKeys.includes(generateKeyingDataErrorKey)) {
    return true;
  }

  throw new Error(`Unrecognised generate keying data error key '${generateKeyingDataErrorKey}'`);
};
