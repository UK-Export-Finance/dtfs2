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

  it('clears the session and returns undefined form values and an undefined errorSummary when the session error keys and form values are undefined', () => {
    // Arrange
    const req = getMockRequest({
      removeFeesFromPaymentErrorKey: undefined,
      editPaymentFormValues: undefined,
    });

    // Act
    const { errors, formValues, allCheckboxesChecked } = getAndClearFieldsFromRedirectSessionData(req);

    // Assert
    assertSessionHasBeenCleared(req);
    expect(errors).toBeUndefined();
    expect(formValues).toBeUndefined();
    expect(allCheckboxesChecked).toBeUndefined();
  });

  it('clears the session and returns provided form values and an undefined errorSummary when the session error keys are undefined', () => {
    // Arrange
    const editPaymentFormValues = anEditPaymentFormValues();
    const req = getMockRequest({
      removeFeesFromPaymentErrorKey: undefined,
      editPaymentFormValues,
    });

    // Act
    const { errors, formValues, allCheckboxesChecked } = getAndClearFieldsFromRedirectSessionData(req);

    // Assert
    assertSessionHasBeenCleared(req);
    expect(errors).toBeUndefined();
    expect(formValues).toEqual(editPaymentFormValues);
    expect(allCheckboxesChecked).toBeUndefined();
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
    "clears the session and returns initialised error view model when the removeFeesFromPaymentErrorKey is '%s'",
    ({ removeFeesFromPaymentErrorKey, expectedAllCheckboxesChecked }) => {
      // Arrange
      const editPaymentFormValues = anEditPaymentFormValues();
      const req = getMockRequest({
        removeFeesFromPaymentErrorKey,
        editPaymentFormValues,
      });

      // Act
      const { errors, formValues, allCheckboxesChecked } = getAndClearFieldsFromRedirectSessionData(req);

      // Assert
      assertSessionHasBeenCleared(req);
      expect(errors).toBeDefined();
      expect(errors!.errorSummary).toHaveLength(1);
      expect(errors!.errorSummary[0].text).toBeDefined();
      expect(errors!.errorSummary[0].href).toBeDefined();
      expect(errors!.removeSelectedFeesErrorMessage).toBeDefined();
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

  function anEditPaymentFormValues(): EditPaymentFormValues {
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
