import { createRequest } from 'node-mocks-http';
import { getAndClearAddPaymentFieldsFromRedirectSessionData } from './get-and-clear-add-payment-fields-from-redirect-session-data';
import { AddPaymentErrorKey } from '../helpers';

type RedirectSessionData = {
  addPaymentErrorKey: AddPaymentErrorKey | undefined;
  checkedCheckboxIds?: Record<string, true | undefined>;
};

describe('controllers/utilisation-reports/utilisation-report-reconciliation-for-report/get-redirect-session-data', () => {
  describe('getAndClearRedirectSessionData', () => {
    const getMockRequest = ({ addPaymentErrorKey, checkedCheckboxIds }: RedirectSessionData) =>
      createRequest({
        session: {
          addPaymentErrorKey,
          checkedCheckboxIds,
        },
      });

    const assertSessionHasBeenCleared = (req: ReturnType<typeof getMockRequest>) => {
      expect(req.session.addPaymentErrorKey).toBeUndefined();
      expect(req.session.checkedCheckboxIds).toBeUndefined();
    };

    const assertIsCheckboxCheckedReturnsValueWithInput = (isCheckboxChecked: (checkboxId: string) => boolean, input: string, output: boolean) => {
      expect(isCheckboxChecked(input)).toBe(output);
    };

    it('returns an undefined addPaymentErrorSummary and default isCheckboxChecked when req.session.addPaymentErrorKey is undefined', () => {
      // Arrange
      const req = getMockRequest({
        addPaymentErrorKey: undefined,
      });

      // Act
      const { addPaymentErrorSummary, isCheckboxChecked } = getAndClearAddPaymentFieldsFromRedirectSessionData(req);

      // Assert
      assertSessionHasBeenCleared(req);
      expect(addPaymentErrorSummary).toBeUndefined();
      assertIsCheckboxCheckedReturnsValueWithInput(isCheckboxChecked, '', false);
    });

    it('throws an error if req.session.addPaymentErrorKey is not recognised', () => {
      // Arrange
      const invalidAddPaymentError = 'invalid-error' as AddPaymentErrorKey;
      const req = getMockRequest({
        addPaymentErrorKey: invalidAddPaymentError,
        checkedCheckboxIds: {},
      });

      // Act / Assert
      expect(() => getAndClearAddPaymentFieldsFromRedirectSessionData(req)).toThrow(Error);
      assertSessionHasBeenCleared(req);
    });

    it.each<AddPaymentErrorKey>([
      'different-fee-record-statuses',
      'multiple-does-not-match-selected',
      'no-fee-records-selected',
      'different-fee-record-payment-currencies',
    ])("returns an array with a single error summary for the addPaymentErrorSummary when the req.session.addPaymentErrorKey is '%s'", (addPaymentErrorKey) => {
      // Arrange
      const req = getMockRequest({
        addPaymentErrorKey,
        checkedCheckboxIds: {},
      });

      // Act
      const { addPaymentErrorSummary } = getAndClearAddPaymentFieldsFromRedirectSessionData(req);

      // Assert
      assertSessionHasBeenCleared(req);
      expect(addPaymentErrorSummary).toHaveLength(1);
      expect(addPaymentErrorSummary![0].text).toBeDefined();
      expect(addPaymentErrorSummary![0].href).toBeDefined();
    });

    it('returns a function which returns true for a checkbox id defined in req.session.checkedCheckboxIds and false otherwise', () => {
      // Arrange
      const checkedCheckboxId = 'some-checkbox-id';
      const uncheckedCheckboxId = 'another-checkbox-id';

      const req = getMockRequest({
        addPaymentErrorKey: 'different-fee-record-statuses',
        checkedCheckboxIds: {
          [checkedCheckboxId]: true,
        },
      });

      // Act
      const { isCheckboxChecked } = getAndClearAddPaymentFieldsFromRedirectSessionData(req);

      // Assert
      assertSessionHasBeenCleared(req);
      assertIsCheckboxCheckedReturnsValueWithInput(isCheckboxChecked, checkedCheckboxId, true);
      assertIsCheckboxCheckedReturnsValueWithInput(isCheckboxChecked, uncheckedCheckboxId, false);
    });
  });
});
