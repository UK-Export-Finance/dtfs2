import { CURRENCY } from '@ukef/dtfs2-common';
import { UtilisationTableRowViewModel } from '../../server/types/view-models';

export const aUtilisationTableRowViewModel = (): UtilisationTableRowViewModel => ({
  feeRecordId: 3,
  facilityId: '33',
  exporter: 'Company',
  baseCurrency: CURRENCY.EUR,
  formattedValue: '300,000.00',
  formattedUtilisation: '200,000.00',
  coverPercentage: 85,
  formattedExposure: '75,000.00',
  feesAccrued: { formattedCurrencyAndAmount: `${CURRENCY.EUR} 123.00`, dataSortValue: 0 },
  feesPayable: { formattedCurrencyAndAmount: `${CURRENCY.EUR} 123.00`, dataSortValue: 0 },
});
