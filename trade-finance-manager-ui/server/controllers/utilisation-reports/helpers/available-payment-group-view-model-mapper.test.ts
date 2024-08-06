import { SelectedFeeRecordsAvailablePaymentGroups } from '@ukef/dtfs2-common';
import { mapToAvailablePaymentGroupsViewModel } from './available-payment-group-view-model-mapper';

describe('available-payment-group-view-model-mapper', () => {
  describe('mapToAvailablePaymentGroupsViewModel', () => {
    it('maps the available payment groups to view model', () => {
      const availablePaymentGroupsData: SelectedFeeRecordsAvailablePaymentGroups = [
        [
          { id: 1, currency: 'USD', amount: 1000, reference: 'REF001' },
          { id: 2, currency: 'USD', amount: 2000, reference: 'REF002' },
        ],
        [{ id: 3, currency: 'USD', amount: 3000, reference: 'REF003' }],
      ];

      const result = mapToAvailablePaymentGroupsViewModel(availablePaymentGroupsData);

      expect(result).toEqual([
        {
          radioId: 'paymentIds-1,2',
          payments: [
            { id: '1', formattedCurrencyAndAmount: 'USD 1,000.00', reference: 'REF001' },
            { id: '2', formattedCurrencyAndAmount: 'USD 2,000.00', reference: 'REF002' },
          ],
        },
        {
          radioId: 'paymentIds-3',
          payments: [{ id: '3', formattedCurrencyAndAmount: 'USD 3,000.00', reference: 'REF003' }],
        },
      ]);
    });
  });
});
