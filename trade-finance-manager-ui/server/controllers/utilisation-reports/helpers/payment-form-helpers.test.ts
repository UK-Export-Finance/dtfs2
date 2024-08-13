import { PaymentErrorsViewModel } from '../../../types/view-models';
import {
  AddPaymentFormRequestBody,
  AddToAnExistingPaymentFormRequestBody,
  EMPTY_ADD_PAYMENT_FORM_VALUES,
  EMPTY_PAYMENT_ERRORS_VIEW_MODEL,
  EditPaymentFormRequestBody,
  extractAddPaymentFormValuesAndValidateIfPresent,
  extractAddToAnExistingPaymentRadioPaymentIdsAndValidateIfPresent,
  extractEditPaymentFormValues,
} from './payment-form-helpers';
import { validateAddPaymentRequestFormValues } from './validate-payment-form-values';

jest.mock('./validate-payment-form-values');

describe('payment-form-helpers', () => {
  describe('extractAddPaymentFormValuesAndValidateIfPresent', () => {
    beforeEach(() => {
      jest.mocked(validateAddPaymentRequestFormValues).mockReturnValue(EMPTY_PAYMENT_ERRORS_VIEW_MODEL);
    });

    describe('when the requestBody addPaymentFormSubmission field is undefined', () => {
      const getBodyWithoutAddPaymentFormSubmissionField = () => {
        const body = aValidAddPaymentFormRequestBody();
        delete body.addPaymentFormSubmission;
        return body;
      };

      it('sets the isAddingPayment property to false', () => {
        // Arrange
        const body = getBodyWithoutAddPaymentFormSubmissionField();

        // Act
        const { isAddingPayment } = extractAddPaymentFormValuesAndValidateIfPresent(body, 'GBP');

        // Assert
        expect(isAddingPayment).toBe(false);
      });

      it('sets the errors property to the empty payment errors view model', () => {
        // Arrange
        const body = getBodyWithoutAddPaymentFormSubmissionField();

        // Act
        const { errors } = extractAddPaymentFormValuesAndValidateIfPresent(body, 'GBP');

        // Assert
        expect(errors).toEqual(EMPTY_PAYMENT_ERRORS_VIEW_MODEL);
      });

      it('sets the formValues property to the empty add payment form values object', () => {
        // Arrange
        const body = getBodyWithoutAddPaymentFormSubmissionField();

        // Act
        const { formValues } = extractAddPaymentFormValuesAndValidateIfPresent(body, 'GBP');

        // Assert
        expect(formValues).toEqual(EMPTY_ADD_PAYMENT_FORM_VALUES);
      });
    });

    describe('when the requestBody addPaymentFormSubmission field is defined', () => {
      const addPaymentFormSubmission = 'some defined value';

      it('sets the isAddingPayment property to true', () => {
        // Arrange
        const body: AddPaymentFormRequestBody = {
          ...aValidAddPaymentFormRequestBody(),
          addPaymentFormSubmission,
        };

        // Act
        const { isAddingPayment } = extractAddPaymentFormValuesAndValidateIfPresent(body, 'GBP');

        // Assert
        expect(isAddingPayment).toBe(true);
      });

      it('sets the formValues paymentCurrency property to the requestBody paymentCurrency', () => {
        // Arrange
        const body: AddPaymentFormRequestBody = {
          ...aValidAddPaymentFormRequestBody(),
          addPaymentFormSubmission,
          paymentCurrency: 'USD',
        };

        // Act
        const { formValues } = extractAddPaymentFormValuesAndValidateIfPresent(body, 'GBP');

        // Assert
        expect(formValues.paymentCurrency).toBe('USD');
      });

      it('sets the formValues paymentAmount property to the requestBody paymentAmount', () => {
        // Arrange
        const body: AddPaymentFormRequestBody = {
          ...aValidAddPaymentFormRequestBody(),
          addPaymentFormSubmission,
          paymentAmount: '314.59',
        };

        // Act
        const { formValues } = extractAddPaymentFormValuesAndValidateIfPresent(body, 'GBP');

        // Assert
        expect(formValues.paymentAmount).toBe('314.59');
      });

      it('sets the formValues paymentDate day property to the requestBody paymentDate-day', () => {
        // Arrange
        const body: AddPaymentFormRequestBody = {
          ...aValidAddPaymentFormRequestBody(),
          addPaymentFormSubmission,
          'paymentDate-day': '10',
        };

        // Act
        const { formValues } = extractAddPaymentFormValuesAndValidateIfPresent(body, 'GBP');

        // Assert
        expect(formValues.paymentDate.day).toBe('10');
      });

      it('sets the formValues paymentDate month property to the requestBody paymentDate-month', () => {
        // Arrange
        const body: AddPaymentFormRequestBody = {
          ...aValidAddPaymentFormRequestBody(),
          addPaymentFormSubmission,
          'paymentDate-month': '6',
        };

        // Act
        const { formValues } = extractAddPaymentFormValuesAndValidateIfPresent(body, 'GBP');

        // Assert
        expect(formValues.paymentDate.month).toBe('6');
      });

      it('sets the formValues paymentDate year property to the requestBody paymentDate-year', () => {
        // Arrange
        const body: AddPaymentFormRequestBody = {
          ...aValidAddPaymentFormRequestBody(),
          addPaymentFormSubmission,
          'paymentDate-year': '2024',
        };

        // Act
        const { formValues } = extractAddPaymentFormValuesAndValidateIfPresent(body, 'GBP');

        // Assert
        expect(formValues.paymentDate.year).toBe('2024');
      });

      it('sets the formValues paymentReference property to the requestBody paymentReference', () => {
        // Arrange
        const body: AddPaymentFormRequestBody = {
          ...aValidAddPaymentFormRequestBody(),
          addPaymentFormSubmission,
          paymentReference: 'A payment reference',
        };

        // Act
        const { formValues } = extractAddPaymentFormValuesAndValidateIfPresent(body, 'GBP');

        // Assert
        expect(formValues.paymentReference).toBe('A payment reference');
      });

      it('sets the formValues addAnotherPayment property to the requestBody addAnotherPayment', () => {
        // Arrange
        const body: AddPaymentFormRequestBody = {
          ...aValidAddPaymentFormRequestBody(),
          addPaymentFormSubmission,
          addAnotherPayment: 'true',
        };

        // Act
        const { formValues } = extractAddPaymentFormValuesAndValidateIfPresent(body, 'GBP');

        // Assert
        expect(formValues.addAnotherPayment).toBe('true');
      });

      it('sets the errors property to the result of the validateAddPaymentRequestFormValues function', () => {
        // Arrange
        const body = {
          ...aValidAddPaymentFormRequestBody(),
          addPaymentFormSubmission,
        };

        const paymentErrors: PaymentErrorsViewModel = {
          errorSummary: [{ text: 'Some text', href: '#some-href' }],
        };
        jest.mocked(validateAddPaymentRequestFormValues).mockReturnValue(paymentErrors);

        // Act
        const { errors } = extractAddPaymentFormValuesAndValidateIfPresent(body, 'GBP');

        // Assert
        expect(errors).toEqual(paymentErrors);
      });
    });

    function aValidAddPaymentFormRequestBody(): AddPaymentFormRequestBody {
      return {
        paymentCurrency: 'GBP',
        paymentAmount: '100',
        'paymentDate-day': '1',
        'paymentDate-month': '5',
        'paymentDate-year': '2024',
        paymentReference: 'Some reference',
        addAnotherPayment: 'true',
        addPaymentFormSubmission: 'true',
      };
    }
  });

  describe('extractEditPaymentFormValues', () => {
    it('sets the formValues paymentAmount property to the requestBody paymentAmount', () => {
      // Arrange
      const body: EditPaymentFormRequestBody = {
        ...aValidEditPaymentFormRequestBody(),
        paymentAmount: '314.59',
      };

      // Act
      const formValues = extractEditPaymentFormValues(body);

      // Assert
      expect(formValues.paymentAmount).toBe('314.59');
    });

    it('sets the formValues paymentDate day property to the requestBody paymentDate-day', () => {
      // Arrange
      const body: EditPaymentFormRequestBody = {
        ...aValidEditPaymentFormRequestBody(),
        'paymentDate-day': '10',
      };

      // Act
      const formValues = extractEditPaymentFormValues(body);

      // Assert
      expect(formValues.paymentDate.day).toBe('10');
    });

    it('sets the formValues paymentDate month property to the requestBody paymentDate-month', () => {
      // Arrange
      const body: EditPaymentFormRequestBody = {
        ...aValidEditPaymentFormRequestBody(),
        'paymentDate-month': '6',
      };

      // Act
      const formValues = extractEditPaymentFormValues(body);

      // Assert
      expect(formValues.paymentDate.month).toBe('6');
    });

    it('sets the formValues paymentDate year property to the requestBody paymentDate-year', () => {
      // Arrange
      const body: EditPaymentFormRequestBody = {
        ...aValidEditPaymentFormRequestBody(),
        'paymentDate-year': '2024',
      };

      // Act
      const formValues = extractEditPaymentFormValues(body);

      // Assert
      expect(formValues.paymentDate.year).toBe('2024');
    });

    it('sets the formValues paymentReference property to the requestBody paymentReference', () => {
      // Arrange
      const body: EditPaymentFormRequestBody = {
        ...aValidEditPaymentFormRequestBody(),
        paymentReference: 'A payment reference',
      };

      // Act
      const formValues = extractEditPaymentFormValues(body);

      // Assert
      expect(formValues.paymentReference).toBe('A payment reference');
    });

    function aValidEditPaymentFormRequestBody(): EditPaymentFormRequestBody {
      return {
        paymentAmount: '100',
        'paymentDate-day': '1',
        'paymentDate-month': '5',
        'paymentDate-year': '2024',
        paymentReference: 'Some reference',
      };
    }
  });

  describe('extractAddToAnExistingPaymentRadioPaymentIdsAndValidateIfPresent', () => {
    it('returns isAddingToAnExistingPayment as false when addToAnExistingPaymentFormSubmission is not in the request body', () => {
      // Arrange
      const requestBody = {};

      // Act
      const result = extractAddToAnExistingPaymentRadioPaymentIdsAndValidateIfPresent(requestBody);

      // Assert
      expect(result.isAddingToAnExistingPayment).toBe(false);
      expect(result.errors).toEqual(EMPTY_PAYMENT_ERRORS_VIEW_MODEL);
      expect(result.paymentIds).toEqual([]);
    });

    it('returns isAddingToAnExistingPayment as true when addToAnExistingPaymentFormSubmission is in the request body', () => {
      // Arrange
      const requestBody: AddToAnExistingPaymentFormRequestBody = {
        addToAnExistingPaymentFormSubmission: 'true',
      };

      // Act
      const result = extractAddToAnExistingPaymentRadioPaymentIdsAndValidateIfPresent(requestBody);

      // Assert
      expect(result.isAddingToAnExistingPayment).toBe(true);
    });

    it('extracts payment ids from the paymentGroup radio id', () => {
      // Arrange
      const requestBody: AddToAnExistingPaymentFormRequestBody = {
        addToAnExistingPaymentFormSubmission: 'true',
        paymentGroup: 'paymentIds-1,2,3',
      };

      // Act
      const result = extractAddToAnExistingPaymentRadioPaymentIdsAndValidateIfPresent(requestBody);

      // Assert
      expect(result.paymentIds).toEqual([1, 2, 3]);
    });

    it('returns empty array for paymentIds when paymentGroup is not provided', () => {
      // Arrange
      const requestBody: AddToAnExistingPaymentFormRequestBody = {
        addToAnExistingPaymentFormSubmission: 'true',
      };

      // Act
      const result = extractAddToAnExistingPaymentRadioPaymentIdsAndValidateIfPresent(requestBody);

      // Assert
      expect(result.paymentIds).toEqual([]);
    });

    it('validates the extracted payment ids', () => {
      // Arrange
      const requestBody: AddToAnExistingPaymentFormRequestBody = {
        addToAnExistingPaymentFormSubmission: 'true',
        paymentGroup: 'paymentIds-1,2,3',
      };

      // Act
      const result = extractAddToAnExistingPaymentRadioPaymentIdsAndValidateIfPresent(requestBody);

      // Assert
      expect(result.errors).not.toEqual(EMPTY_PAYMENT_ERRORS_VIEW_MODEL);
    });
  });
});
