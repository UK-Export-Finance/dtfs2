import { createRequest } from 'node-mocks-http';
import { getAndClearFieldsFromRedirectSessionData } from './get-and-clear-fields-from-redirect-session-data';
import { RemoveFeesFromPaymentErrorKey } from '../helpers';
import { EditPaymentFormValues } from '../../../types/edit-payment-form-values';

type RedirectSessionData = {
  removeFeesFromPaymentErrorKey: RemoveFeesFromPaymentErrorKey | undefined;
  editPaymentFormValues: EditPaymentFormValues | undefined;
};

describe('getAndClearFieldsFromRedirectSessionData', () => {
  const getMockRequest = ({ removeFeesFromPaymentErrorKey, editPaymentFormValues }: RedirectSessionData) =>
    createRequest({
      session: {
        removeFeesFromPaymentErrorKey,
        editPaymentFormValues,
      },
    });

  const assertSessionHasBeenCleared = (req: ReturnType<typeof getMockRequest>) => {
    expect(req.session.removeFeesFromPaymentErrorKey).toBeUndefined();
    expect(req.session.editPaymentFormValues).toBeUndefined();
  };

  it('clears the session and returns provided form values and an undefined errorSummary when the session error keys are undefined', () => {
    // Arrange
    const editPaymentFormValues = aSetOfEditPaymentFormValues();
    const req = getMockRequest({
      removeFeesFromPaymentErrorKey: undefined,
      editPaymentFormValues,
    });

    // Act
    const { errors: { errorSummary } = {}, formValues, allCheckboxesChecked } = getAndClearFieldsFromRedirectSessionData(req);

    // Assert
    assertSessionHasBeenCleared(req);
    expect(errorSummary).toBeUndefined();
    expect(formValues).toEqual(editPaymentFormValues);
    expect(allCheckboxesChecked).toEqual(undefined);
  });

  it.each<{
    removeFeesFromPaymentErrorKey: RemoveFeesFromPaymentErrorKey;
    expectedAllCheckboxesChecked: boolean;
  }>([
    {
      removeFeesFromPaymentErrorKey: 'no-fee-records-selected',
      expectedAllCheckboxesChecked: false,
    },
    {
      removeFeesFromPaymentErrorKey: 'all-fee-records-selected',
      expectedAllCheckboxesChecked: true,
    },
  ])(
    "clears the session and returns an array with a single error summary for the errorSummary when the removeFeesFromPaymentErrorKey is '%s'",
    ({ removeFeesFromPaymentErrorKey, expectedAllCheckboxesChecked }) => {
      // Arrange
      const editPaymentFormValues = aSetOfEditPaymentFormValues();
      const req = getMockRequest({
        removeFeesFromPaymentErrorKey,
        editPaymentFormValues,
      });

      // Act
      const { errors: { errorSummary } = {}, formValues, allCheckboxesChecked } = getAndClearFieldsFromRedirectSessionData(req);

      // Assert
      assertSessionHasBeenCleared(req);
      expect(errorSummary).toHaveLength(1);
      expect(errorSummary![0].text).toBeDefined();
      expect(errorSummary![0].href).toBeDefined();
      expect(formValues).toEqual(editPaymentFormValues);
      expect(allCheckboxesChecked).toEqual(expectedAllCheckboxesChecked);
    },
  );

  it('throws an error if the session removeFeesFromPaymentErrorKey is not recognised', () => {
    // Arrange
    const invalidRemoveFeesFromPaymentError = 'invalid-error' as RemoveFeesFromPaymentErrorKey;
    const req = getMockRequest({
      removeFeesFromPaymentErrorKey: invalidRemoveFeesFromPaymentError,
      editPaymentFormValues: undefined,
    });

    // Act / Assert
    expect(() => getAndClearFieldsFromRedirectSessionData(req)).toThrow(Error);
    assertSessionHasBeenCleared(req);
  });

  function aSetOfEditPaymentFormValues(): EditPaymentFormValues {
    return {
      paymentAmount: '7',
      paymentDate: {
        day: '1',
        month: '2',
        year: '2023',
      },
      paymentReference: 'A payment reference',
    };
  }
});
