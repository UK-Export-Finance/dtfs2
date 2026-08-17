import type { Currency } from '@ukef/dtfs2-common';
import { CURRENCY } from '@ukef/dtfs2-common';
import { ACCRUAL_FREQUENCY_CODE_MAP, ACCRUAL_SCHEDULE_INDEX_RATE_CODES } from '../../../constants';

const { QUARTERLY } = ACCRUAL_FREQUENCY_CODE_MAP;
const { EUR, GBP, JPY, USD, UNKNOWN } = ACCRUAL_SCHEDULE_INDEX_RATE_CODES;

type MapEwcsIndexRateCodeParams = {
  currency: Currency;
  frequencyCode: string | null;
};

/**
 * Maps the facility's currency and accrual frequency code to the corresponding APIM/GIFT index rate code for EWCS facilities.
 * @param params - The parameters required to map the EWCS index rate code, including:
 * @param {Currency} params.currency - The facility currency code.
 * @param {string | null} params.frequencyCode - The facility's accrual frequency code.
 * @returns {string} - The corresponding GIFT index rate code for EWCS facilities, or 'UNKNOWN_INDEX_RATE_CODE' if not found.
 */
export const mapEwcsIndexRateCode = ({ currency, frequencyCode }: MapEwcsIndexRateCodeParams) => {
  switch (currency) {
    case CURRENCY.EUR:
      switch (frequencyCode) {
        case QUARTERLY:
          return EUR.QUARTERLY;
        default:
          return EUR.OTHER;
      }

    case CURRENCY.GBP:
      switch (frequencyCode) {
        case QUARTERLY:
          return GBP.QUARTERLY;
        default:
          return GBP.OTHER;
      }

    case CURRENCY.JPY:
      switch (frequencyCode) {
        case QUARTERLY:
          return JPY.QUARTERLY;
        default:
          return JPY.OTHER;
      }

    case CURRENCY.USD:
      switch (frequencyCode) {
        case QUARTERLY:
          return USD.QUARTERLY;
        default:
          return USD.OTHER;
      }

    default:
      return UNKNOWN;
  }
};
