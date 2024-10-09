import { CURRENCY, Currency } from '@ukef/dtfs2-common';
import { subDays } from 'date-fns';
import {
  validateAddPaymentRequestFormValues,
  validateAddToAnExistingPaymentRequestFormValues,
  validateEditPaymentRequestFormValues,
} from './validate-payment-form-values';
import { AddPaymentFormValues } from '../../../types/add-payment-form-values';
import { EditPaymentFormValues } from '../../../types/edit-payment-form-values';
import { PaymentDateErrorViewModel } from '../../../types/view-models';

describe('validate-payment-form-values', () => {
  describe('validateAddPaymentRequestFormValues', () => {
    const paymentCurrency: Currency = 'GBP';
    const feeRecordPaymentCurrency = paymentCurrency;

    it('should set payment currency error when no payment currency is provided', () => {
      // Arrange
      const formValues: AddPaymentFormValues = {
        ...aValidSetOfFormValues(),
        paymentCurrency: undefined,
      };

      // Act
      const errors = validateAddPaymentRequestFormValues(formValues, feeRecordPaymentCurrency);

      // Assert
      expect(errors.errorSummary).toEqual([{ text: 'Select payment currency', href: '#paymentCurrency' }]);
      expect(errors.paymentCurrencyErrorMessage).toEqual('Select payment currency');
    });

    it('should set payment currency error when payment currency value provided is not an accepted payment currency', () => {
      // Arrange
      const formValues: AddPaymentFormValues = {
        ...aValidSetOfFormValues(),
        paymentCurrency: 'AUD',
      };

      // Act
      const errors = validateAddPaymentRequestFormValues(formValues, feeRecordPaymentCurrency);

      // Assert
      expect(errors.errorSummary).toEqual([{ text: 'Select payment currency', href: '#paymentCurrency' }]);
      expect(errors.paymentCurrencyErrorMessage).toEqual('Select payment currency');
    });

    it('should set payment currency error when payment currency value provided does not match fee record payment currency', () => {
      // Arrange
      const formValues: AddPaymentFormValues = {
        ...aValidSetOfFormValues(),
        paymentCurrency: CURRENCY.GBP,
      };

      const nonMatchingFeeRecordPaymentCurrency = CURRENCY.EUR;

      // Act
      const errors = validateAddPaymentRequestFormValues(formValues, nonMatchingFeeRecordPaymentCurrency);

      // Assert
      expect(errors.errorSummary).toEqual([
        { text: 'The new payment currency must be the same as the reported payment currency of the selected fees', href: '#paymentCurrency' },
      ]);
      expect(errors.paymentCurrencyErrorMessage).toEqual('The new payment currency must be the same as the reported payment currency of the selected fees');
    });

    it.each(Object.values(CURRENCY))('should not set payment currency error when payment currency value is %s', (currency: Currency) => {
      // Arrange
      const formValues: AddPaymentFormValues = {
        ...aValidSetOfFormValues(),
        paymentCurrency: currency,
      };

      // Act
      const errors = validateAddPaymentRequestFormValues(formValues, currency);

      // Assert
      expect(errors.errorSummary.length).toEqual(0);
      expect(errors.paymentCurrencyErrorMessage).toEqual(undefined);
    });

    it('should set payment amount error when no payment amount is provided', () => {
      // Arrange
      const formValues: AddPaymentFormValues = {
        ...aValidSetOfFormValues(),
        paymentAmount: undefined,
      };

      // Act
      const errors = validateAddPaymentRequestFormValues(formValues, feeRecordPaymentCurrency);

      // Assert
      expect(errors.errorSummary).toEqual([{ text: 'Enter a valid amount received', href: '#paymentAmount' }]);
      expect(errors.paymentAmountErrorMessage).toEqual('Enter a valid amount received');
    });

    it.each`
      description                                         | paymentAmount
      ${'has more than two decimal places'}               | ${'100.234'}
      ${'is not a number'}                                | ${'one million'}
      ${'has commas in non thousand separator positions'} | ${'1,1'}
    `('should set payment amount error when payment amount value $description', ({ paymentAmount }: { paymentAmount: string }) => {
      // Arrange
      const formValues: AddPaymentFormValues = {
        ...aValidSetOfFormValues(),
        paymentAmount,
      };

      // Act
      const errors = validateAddPaymentRequestFormValues(formValues, feeRecordPaymentCurrency);

      // Assert
      expect(errors.errorSummary).toEqual([{ text: 'Enter a valid amount received', href: '#paymentAmount' }]);
      expect(errors.paymentAmountErrorMessage).toEqual('Enter a valid amount received');
    });

    it.each`
      description                   | paymentAmount
      ${'has thousands separators'} | ${'1,000,000'}
      ${'is an integer'}            | ${'10000'}
      ${'has one decimal place'}    | ${'100.1'}
      ${'has two decimal places'}   | ${'100.12'}
    `('should not set payment amount error when payment amount value $description', ({ paymentAmount }: { paymentAmount: string }) => {
      // Arrange
      const formValues: AddPaymentFormValues = {
        ...aValidSetOfFormValues(),
        paymentAmount,
      };

      // Act
      const errors = validateAddPaymentRequestFormValues(formValues, feeRecordPaymentCurrency);

      // Assert
      expect(errors.errorSummary.length).toEqual(0);
      expect(errors.paymentAmountErrorMessage).toEqual(undefined);
    });

    it('should set payment reference error when payment reference is more than fifty characters', () => {
      // Arrange
      const formValues: AddPaymentFormValues = {
        ...aValidSetOfFormValues(),
        paymentReference: 'This is a string with exactly 51 characters........',
      };

      // Act
      const errors = validateAddPaymentRequestFormValues(formValues, feeRecordPaymentCurrency);

      // Assert
      expect(errors.errorSummary).toEqual([{ text: 'Payment reference must be 50 characters or less', href: '#paymentReference' }]);
      expect(errors.paymentReferenceErrorMessage).toEqual('Payment reference must be 50 characters or less');
    });

    it('should not set payment reference error when payment reference value is not provided', () => {
      // Arrange
      const formValues: AddPaymentFormValues = {
        ...aValidSetOfFormValues(),
        paymentReference: undefined,
      };

      // Act
      const errors = validateAddPaymentRequestFormValues(formValues, feeRecordPaymentCurrency);

      // Assert
      expect(errors.errorSummary.length).toEqual(0);
      expect(errors.paymentReferenceErrorMessage).toEqual(undefined);
    });

    it('should not set payment reference error when payment reference is less than fifty one characters', () => {
      // Arrange
      const formValues: AddPaymentFormValues = {
        ...aValidSetOfFormValues(),
        paymentReference: 'This is a string with exactly 50 characters.......',
      };

      // Act
      const errors = validateAddPaymentRequestFormValues(formValues, feeRecordPaymentCurrency);

      // Assert
      expect(errors.errorSummary.length).toEqual(0);
      expect(errors.paymentReferenceErrorMessage).toEqual(undefined);
    });

    it('should set add another payment error when no value is provided', () => {
      // Arrange
      const formValues: AddPaymentFormValues = {
        ...aValidSetOfFormValues(),
        addAnotherPayment: undefined,
      };

      // Act
      const errors = validateAddPaymentRequestFormValues(formValues, feeRecordPaymentCurrency);

      // Assert
      expect(errors.errorSummary).toEqual([{ text: 'Select add another payment choice', href: '#addAnotherPayment' }]);
      expect(errors.addAnotherPaymentErrorMessage).toEqual('Select add another payment choice');
    });

    it('should set add another payment error when value provided is not true or false', () => {
      // Arrange
      const formValues: AddPaymentFormValues = {
        ...aValidSetOfFormValues(),
        addAnotherPayment: 'not an option' as 'true' | 'false',
      };

      // Act
      const errors = validateAddPaymentRequestFormValues(formValues, feeRecordPaymentCurrency);

      // Assert
      expect(errors.errorSummary).toEqual([{ text: 'Select add another payment choice', href: '#addAnotherPayment' }]);
      expect(errors.addAnotherPaymentErrorMessage).toEqual('Select add another payment choice');
    });

    it.each(['true', 'false'] as const)('should not set add another payment error when value provided is %s', (addAnotherPaymentChoice) => {
      // Arrange
      const formValues: AddPaymentFormValues = {
        ...aValidSetOfFormValues(),
        addAnotherPayment: addAnotherPaymentChoice,
      };

      // Act
      const errors = validateAddPaymentRequestFormValues(formValues, feeRecordPaymentCurrency);

      // Assert
      expect(errors.errorSummary.length).toEqual(0);
      expect(errors.paymentReferenceErrorMessage).toEqual(undefined);
    });

    it.each`
      missingFields            | date                                                        | expectedErrorMessage
      ${'day, month and year'} | ${{ day: undefined, month: undefined, year: undefined }}    | ${'Enter the date payment received'}
      ${'month and year'}      | ${{ day: '12', month: undefined, year: undefined }}         | ${'The date payment received must include a month and year'}
      ${'day and year'}        | ${{ day: undefined, month: '12', year: undefined }}         | ${'The date payment received must include a day and year'}
      ${'day and month'}       | ${{ day: undefined, month: undefined, year: '202332' }}     | ${'The date payment received must include a day and month'}
      ${'year'}                | ${{ day: '12', month: 'January', year: undefined }}         | ${'The date payment received must include a year'}
      ${'month'}               | ${{ day: '12', month: undefined, year: 'twenty thousand' }} | ${'The date payment received must include a month'}
      ${'day'}                 | ${{ day: undefined, month: 'January', year: '2000' }}       | ${'The date payment received must include a day'}
    `(
      'should set payment date error message to "$expectedErrormessage" when date is missing fields: $missingFields',
      ({
        date,
        expectedErrorMessage,
      }: {
        date: { day: string | undefined; month: string | undefined; year: string | undefined };
        expectedErrorMessage: string;
      }) => {
        // Arrange
        const formValues: AddPaymentFormValues = {
          ...aValidSetOfFormValues(),
          paymentDate: date,
        };

        // Act
        const errors = validateAddPaymentRequestFormValues(formValues, feeRecordPaymentCurrency);

        // Assert
        expect(errors.errorSummary.length).toEqual(1);
        expect(errors.errorSummary[0].text).toEqual(expectedErrorMessage);
        expect(errors.paymentDateError?.message).toEqual(expectedErrorMessage);
      },
    );

    it.each`
      missingFields            | date                                                        | hasDayError | hasMonthError | hasYearError
      ${'day, month and year'} | ${{ day: undefined, month: undefined, year: undefined }}    | ${true}     | ${true}       | ${true}
      ${'month and year'}      | ${{ day: '12', month: undefined, year: undefined }}         | ${false}    | ${true}       | ${true}
      ${'day and year'}        | ${{ day: undefined, month: '12', year: undefined }}         | ${true}     | ${false}      | ${true}
      ${'day and month'}       | ${{ day: undefined, month: undefined, year: '202332' }}     | ${true}     | ${true}       | ${false}
      ${'year'}                | ${{ day: '12', month: 'January', year: undefined }}         | ${false}    | ${false}      | ${true}
      ${'month'}               | ${{ day: '12', month: undefined, year: 'twenty thousand' }} | ${false}    | ${true}       | ${false}
      ${'day'}                 | ${{ day: undefined, month: 'January', year: '2000' }}       | ${true}     | ${false}      | ${false}
    `(
      'should set payment date error field errors when missing the $missingFields',
      ({
        date,
        hasDayError,
        hasMonthError,
        hasYearError,
      }: {
        date: { day: string | undefined; month: string | undefined; year: string | undefined };
        hasDayError: boolean;
        hasMonthError: boolean;
        hasYearError: boolean;
      }) => {
        // Arrange
        const formValues: AddPaymentFormValues = {
          ...aValidSetOfFormValues(),
          paymentDate: date,
        };

        // Act
        const errors = validateAddPaymentRequestFormValues(formValues, feeRecordPaymentCurrency);

        // Assert
        expect(errors.paymentDateError?.dayError).toEqual(hasDayError);
        expect(errors.paymentDateError?.monthError).toEqual(hasMonthError);
        expect(errors.paymentDateError?.yearError).toEqual(hasYearError);
      },
    );

    it.each`
      missingFields            | date                                                        | expectedHref
      ${'day, month and year'} | ${{ day: undefined, month: undefined, year: undefined }}    | ${'#paymentDate-day'}
      ${'month and year'}      | ${{ day: '12', month: undefined, year: undefined }}         | ${'#paymentDate-month'}
      ${'day and year'}        | ${{ day: undefined, month: '12', year: undefined }}         | ${'#paymentDate-day'}
      ${'day and month'}       | ${{ day: undefined, month: undefined, year: '202332' }}     | ${'#paymentDate-day'}
      ${'year'}                | ${{ day: '12', month: 'January', year: undefined }}         | ${'#paymentDate-year'}
      ${'month'}               | ${{ day: '12', month: undefined, year: 'twenty thousand' }} | ${'#paymentDate-month'}
      ${'day'}                 | ${{ day: undefined, month: 'January', year: '2000' }}       | ${'#paymentDate-day'}
    `(
      'should set href to id of first missing field when missing fields: $missingFields',
      ({ date, expectedHref }: { date: { day: string | undefined; month: string | undefined; year: string | undefined }; expectedHref: string }) => {
        // Arrange
        const formValues: AddPaymentFormValues = {
          ...aValidSetOfFormValues(),
          paymentDate: date,
        };

        // Act
        const errors = validateAddPaymentRequestFormValues(formValues, feeRecordPaymentCurrency);

        // Assert
        expect(errors.errorSummary.length).toEqual(1);
        expect(errors.errorSummary[0].href).toEqual(expectedHref);
      },
    );

    it.each`
      description               | dayValue
      ${'is not a number'}      | ${'this is not a number'}
      ${'has decimal places'}   | ${'12.5'}
      ${'is a negative number'} | ${'-1'}
      ${'is less than one'}     | ${'0'}
      ${'is greater than 31'}   | ${'32'}
    `('should set payment date error when day $description', ({ dayValue }: { dayValue: string }) => {
      // Arrange
      const formValues: AddPaymentFormValues = {
        ...aValidSetOfFormValues(),
        paymentDate: { day: dayValue, month: '12', year: '2023' },
      };

      // Act
      const errors = validateAddPaymentRequestFormValues(formValues, feeRecordPaymentCurrency);

      // Assert
      expect(errors.errorSummary).toEqual([{ text: 'The date payment received must be a real date', href: '#paymentDate-day' }]);
      expect(errors.paymentDateError).toEqual<PaymentDateErrorViewModel>({
        message: 'The date payment received must be a real date',
        dayError: true,
        monthError: false,
        yearError: false,
      });
    });

    it.each`
      description               | monthValue
      ${'is not a number'}      | ${'this is not a number'}
      ${'has decimal places'}   | ${'12.5'}
      ${'is a negative number'} | ${'-1'}
      ${'is less than one'}     | ${'0'}
      ${'is greater than 12'}   | ${'13'}
    `('should set payment date error when month $description', ({ monthValue }: { monthValue: string }) => {
      // Arrange
      const formValues: AddPaymentFormValues = {
        ...aValidSetOfFormValues(),
        paymentDate: { day: '1', month: monthValue, year: '2023' },
      };

      // Act
      const errors = validateAddPaymentRequestFormValues(formValues, feeRecordPaymentCurrency);

      // Assert
      expect(errors.errorSummary).toEqual([{ text: 'The date payment received must be a real date', href: '#paymentDate-month' }]);
      expect(errors.paymentDateError).toEqual<PaymentDateErrorViewModel>({
        message: 'The date payment received must be a real date',
        dayError: false,
        monthError: true,
        yearError: false,
      });
    });

    it.each`
      description                    | yearValue
      ${'is not a number'}           | ${'this is not a number'}
      ${'has decimal places'}        | ${'12.5'}
      ${'is a negative number'}      | ${'-100'}
      ${'has less than four digits'} | ${'123'}
      ${'has more than four digits'} | ${'12345'}
    `('should set payment date error when year $description', ({ yearValue }: { yearValue: string }) => {
      // Arrange
      const formValues: AddPaymentFormValues = {
        ...aValidSetOfFormValues(),
        paymentDate: { day: '1', month: '1', year: yearValue },
      };

      // Act
      const errors = validateAddPaymentRequestFormValues(formValues, feeRecordPaymentCurrency);

      // Assert
      expect(errors.errorSummary).toEqual([{ text: 'The date payment received must be a real date', href: '#paymentDate-year' }]);
      expect(errors.paymentDateError).toEqual<PaymentDateErrorViewModel>({
        message: 'The date payment received must be a real date',
        dayError: false,
        monthError: false,
        yearError: true,
      });
    });

    it('should set payment date error if day is between 1 and 31 and month between 1 and 12 and year four digits but date is not a real date', () => {
      // Arrange
      const formValues: AddPaymentFormValues = {
        ...aValidSetOfFormValues(),
        paymentDate: { day: '31', month: '2', year: '2023' },
      };

      // Act
      const errors = validateAddPaymentRequestFormValues(formValues, feeRecordPaymentCurrency);

      // Assert
      expect(errors.errorSummary).toEqual([{ text: 'The date payment received must be a real date', href: '#paymentDate-day' }]);
      expect(errors.paymentDateError).toEqual<PaymentDateErrorViewModel>({
        message: 'The date payment received must be a real date',
        dayError: true,
        monthError: true,
        yearError: true,
      });
    });

    it('should set payment date error if payment date is not in the past', () => {
      // Arrange
      const today = new Date();
      const formValues: AddPaymentFormValues = {
        ...aValidSetOfFormValues(),
        paymentDate: { day: today.getDate().toString(), month: (today.getMonth() + 1).toString(), year: today.getFullYear().toString() },
      };

      // Act
      const errors = validateAddPaymentRequestFormValues(formValues, feeRecordPaymentCurrency);

      // Assert
      expect(errors.errorSummary).toEqual([{ text: 'The date payment received must be in the past', href: '#paymentDate-day' }]);
      expect(errors.paymentDateError).toEqual<PaymentDateErrorViewModel>({
        message: 'The date payment received must be in the past',
        dayError: true,
        monthError: true,
        yearError: true,
      });
    });

    it('should not set payment date error if payment date is in the past', () => {
      // Arrange
      const today = new Date();
      const yesterday = subDays(today, 1);
      const formValues: AddPaymentFormValues = {
        ...aValidSetOfFormValues(),
        paymentDate: { day: yesterday.getDate().toString(), month: (yesterday.getMonth() + 1).toString(), year: yesterday.getFullYear().toString() },
      };

      // Act
      const errors = validateAddPaymentRequestFormValues(formValues, feeRecordPaymentCurrency);

      // Assert
      expect(errors.errorSummary.length).toEqual(0);
      expect(errors.paymentDateError).toEqual(undefined);
    });

    it('when there are multiple errors should include all errors in error summary', () => {
      // Arrange
      const formValues: AddPaymentFormValues = { paymentDate: {} };

      // Act
      const errors = validateAddPaymentRequestFormValues(formValues, feeRecordPaymentCurrency);

      // Assert
      expect(errors.errorSummary).toEqual(
        expect.arrayContaining([
          { text: 'Select payment currency', href: '#paymentCurrency' },
          { text: 'Enter a valid amount received', href: '#paymentAmount' },
          { text: 'Enter the date payment received', href: '#paymentDate-day' },
          { text: 'Select add another payment choice', href: '#addAnotherPayment' },
        ]),
      );
    });

    function aValidSetOfFormValues(): AddPaymentFormValues {
      return {
        paymentCurrency,
        paymentAmount: '100.00',
        paymentDate: {
          day: '11',
          month: '11',
          year: '1111',
        },
        paymentReference: 'REFERENCE',
        addAnotherPayment: 'true',
      };
    }
  });

  describe('validateEditPaymentRequestFormValues', () => {
    it('should set payment amount error when no payment amount is provided', () => {
      // Arrange
      const formValues: EditPaymentFormValues = {
        ...aValidSetOfFormValues(),
        paymentAmount: undefined,
      };

      // Act
      const errors = validateEditPaymentRequestFormValues(formValues);

      // Assert
      expect(errors.errorSummary).toEqual([{ text: 'Enter a valid amount received', href: '#paymentAmount' }]);
      expect(errors.paymentAmountErrorMessage).toEqual('Enter a valid amount received');
    });

    it.each`
      description                                         | paymentAmount
      ${'has more than two decimal places'}               | ${'100.234'}
      ${'is not a number'}                                | ${'one million'}
      ${'has commas in non thousand separator positions'} | ${'1,1'}
    `('should set payment amount error when payment amount value $description', ({ paymentAmount }: { paymentAmount: string }) => {
      // Arrange
      const formValues: EditPaymentFormValues = {
        ...aValidSetOfFormValues(),
        paymentAmount,
      };

      // Act
      const errors = validateEditPaymentRequestFormValues(formValues);

      // Assert
      expect(errors.errorSummary).toEqual([{ text: 'Enter a valid amount received', href: '#paymentAmount' }]);
      expect(errors.paymentAmountErrorMessage).toEqual('Enter a valid amount received');
    });

    it.each`
      description                   | paymentAmount
      ${'has thousands separators'} | ${'1,000,000'}
      ${'is an integer'}            | ${'10000'}
      ${'has one decimal place'}    | ${'100.1'}
      ${'has two decimal places'}   | ${'100.12'}
    `('should not set payment amount error when payment amount value $description', ({ paymentAmount }: { paymentAmount: string }) => {
      // Arrange
      const formValues: EditPaymentFormValues = {
        ...aValidSetOfFormValues(),
        paymentAmount,
      };

      // Act
      const errors = validateEditPaymentRequestFormValues(formValues);

      // Assert
      expect(errors.errorSummary.length).toEqual(0);
      expect(errors.paymentAmountErrorMessage).toEqual(undefined);
    });

    it('should set payment reference error when payment reference is more than fifty characters', () => {
      // Arrange
      const formValues: EditPaymentFormValues = {
        ...aValidSetOfFormValues(),
        paymentReference: 'This is a string with exactly 51 characters........',
      };

      // Act
      const errors = validateEditPaymentRequestFormValues(formValues);

      // Assert
      expect(errors.errorSummary).toEqual([{ text: 'Payment reference must be 50 characters or less', href: '#paymentReference' }]);
      expect(errors.paymentReferenceErrorMessage).toEqual('Payment reference must be 50 characters or less');
    });

    it('should not set payment reference error when payment reference value is not provided', () => {
      // Arrange
      const formValues: EditPaymentFormValues = {
        ...aValidSetOfFormValues(),
        paymentReference: undefined,
      };

      // Act
      const errors = validateEditPaymentRequestFormValues(formValues);

      // Assert
      expect(errors.errorSummary.length).toEqual(0);
      expect(errors.paymentReferenceErrorMessage).toEqual(undefined);
    });

    it('should not set payment reference error when payment reference is less than fifty one characters', () => {
      // Arrange
      const formValues: EditPaymentFormValues = {
        ...aValidSetOfFormValues(),
        paymentReference: 'This is a string with exactly 50 characters.......',
      };

      // Act
      const errors = validateEditPaymentRequestFormValues(formValues);

      // Assert
      expect(errors.errorSummary.length).toEqual(0);
      expect(errors.paymentReferenceErrorMessage).toEqual(undefined);
    });

    it.each`
      missingFields            | date                                                        | expectedErrorMessage
      ${'day, month and year'} | ${{ day: undefined, month: undefined, year: undefined }}    | ${'Enter the date payment received'}
      ${'month and year'}      | ${{ day: '12', month: undefined, year: undefined }}         | ${'The date payment received must include a month and year'}
      ${'day and year'}        | ${{ day: undefined, month: '12', year: undefined }}         | ${'The date payment received must include a day and year'}
      ${'day and month'}       | ${{ day: undefined, month: undefined, year: '202332' }}     | ${'The date payment received must include a day and month'}
      ${'year'}                | ${{ day: '12', month: 'January', year: undefined }}         | ${'The date payment received must include a year'}
      ${'month'}               | ${{ day: '12', month: undefined, year: 'twenty thousand' }} | ${'The date payment received must include a month'}
      ${'day'}                 | ${{ day: undefined, month: 'January', year: '2000' }}       | ${'The date payment received must include a day'}
    `(
      'should set payment date error message to "$expectedErrormessage" when date is missing fields: $missingFields',
      ({
        date,
        expectedErrorMessage,
      }: {
        date: { day: string | undefined; month: string | undefined; year: string | undefined };
        expectedErrorMessage: string;
      }) => {
        // Arrange
        const formValues: EditPaymentFormValues = {
          ...aValidSetOfFormValues(),
          paymentDate: date,
        };

        // Act
        const errors = validateEditPaymentRequestFormValues(formValues);

        // Assert
        expect(errors.errorSummary.length).toEqual(1);
        expect(errors.errorSummary[0].text).toEqual(expectedErrorMessage);
        expect(errors.paymentDateError?.message).toEqual(expectedErrorMessage);
      },
    );

    it.each`
      missingFields            | date                                                        | hasDayError | hasMonthError | hasYearError
      ${'day, month and year'} | ${{ day: undefined, month: undefined, year: undefined }}    | ${true}     | ${true}       | ${true}
      ${'month and year'}      | ${{ day: '12', month: undefined, year: undefined }}         | ${false}    | ${true}       | ${true}
      ${'day and year'}        | ${{ day: undefined, month: '12', year: undefined }}         | ${true}     | ${false}      | ${true}
      ${'day and month'}       | ${{ day: undefined, month: undefined, year: '202332' }}     | ${true}     | ${true}       | ${false}
      ${'year'}                | ${{ day: '12', month: 'January', year: undefined }}         | ${false}    | ${false}      | ${true}
      ${'month'}               | ${{ day: '12', month: undefined, year: 'twenty thousand' }} | ${false}    | ${true}       | ${false}
      ${'day'}                 | ${{ day: undefined, month: 'January', year: '2000' }}       | ${true}     | ${false}      | ${false}
    `(
      'should set payment date error field errors when missing the $missingFields',
      ({
        date,
        hasDayError,
        hasMonthError,
        hasYearError,
      }: {
        date: { day: string | undefined; month: string | undefined; year: string | undefined };
        hasDayError: boolean;
        hasMonthError: boolean;
        hasYearError: boolean;
      }) => {
        // Arrange
        const formValues: EditPaymentFormValues = {
          ...aValidSetOfFormValues(),
          paymentDate: date,
        };

        // Act
        const errors = validateEditPaymentRequestFormValues(formValues);

        // Assert
        expect(errors.paymentDateError?.dayError).toEqual(hasDayError);
        expect(errors.paymentDateError?.monthError).toEqual(hasMonthError);
        expect(errors.paymentDateError?.yearError).toEqual(hasYearError);
      },
    );

    it.each`
      missingFields            | date                                                        | expectedHref
      ${'day, month and year'} | ${{ day: undefined, month: undefined, year: undefined }}    | ${'#paymentDate-day'}
      ${'month and year'}      | ${{ day: '12', month: undefined, year: undefined }}         | ${'#paymentDate-month'}
      ${'day and year'}        | ${{ day: undefined, month: '12', year: undefined }}         | ${'#paymentDate-day'}
      ${'day and month'}       | ${{ day: undefined, month: undefined, year: '202332' }}     | ${'#paymentDate-day'}
      ${'year'}                | ${{ day: '12', month: 'January', year: undefined }}         | ${'#paymentDate-year'}
      ${'month'}               | ${{ day: '12', month: undefined, year: 'twenty thousand' }} | ${'#paymentDate-month'}
      ${'day'}                 | ${{ day: undefined, month: 'January', year: '2000' }}       | ${'#paymentDate-day'}
    `(
      'should set href to id of first missing field when missing fields: $missingFields',
      ({ date, expectedHref }: { date: { day: string | undefined; month: string | undefined; year: string | undefined }; expectedHref: string }) => {
        // Arrange
        const formValues: EditPaymentFormValues = {
          ...aValidSetOfFormValues(),
          paymentDate: date,
        };

        // Act
        const errors = validateEditPaymentRequestFormValues(formValues);

        // Assert
        expect(errors.errorSummary.length).toEqual(1);
        expect(errors.errorSummary[0].href).toEqual(expectedHref);
      },
    );

    it.each`
      description               | dayValue
      ${'is not a number'}      | ${'this is not a number'}
      ${'has decimal places'}   | ${'12.5'}
      ${'is a negative number'} | ${'-1'}
      ${'is less than one'}     | ${'0'}
      ${'is greater than 31'}   | ${'32'}
    `('should set payment date error when day $description', ({ dayValue }: { dayValue: string }) => {
      // Arrange
      const formValues: EditPaymentFormValues = {
        ...aValidSetOfFormValues(),
        paymentDate: { day: dayValue, month: '12', year: '2023' },
      };

      // Act
      const errors = validateEditPaymentRequestFormValues(formValues);

      // Assert
      expect(errors.errorSummary).toEqual([{ text: 'The date payment received must be a real date', href: '#paymentDate-day' }]);
      expect(errors.paymentDateError).toEqual<PaymentDateErrorViewModel>({
        message: 'The date payment received must be a real date',
        dayError: true,
        monthError: false,
        yearError: false,
      });
    });

    it.each`
      description               | monthValue
      ${'is not a number'}      | ${'this is not a number'}
      ${'has decimal places'}   | ${'12.5'}
      ${'is a negative number'} | ${'-1'}
      ${'is less than one'}     | ${'0'}
      ${'is greater than 12'}   | ${'13'}
    `('should set payment date error when month $description', ({ monthValue }: { monthValue: string }) => {
      // Arrange
      const formValues: EditPaymentFormValues = {
        ...aValidSetOfFormValues(),
        paymentDate: { day: '1', month: monthValue, year: '2023' },
      };

      // Act
      const errors = validateEditPaymentRequestFormValues(formValues);

      // Assert
      expect(errors.errorSummary).toEqual([{ text: 'The date payment received must be a real date', href: '#paymentDate-month' }]);
      expect(errors.paymentDateError).toEqual<PaymentDateErrorViewModel>({
        message: 'The date payment received must be a real date',
        dayError: false,
        monthError: true,
        yearError: false,
      });
    });

    it.each`
      description                    | yearValue
      ${'is not a number'}           | ${'this is not a number'}
      ${'has decimal places'}        | ${'12.5'}
      ${'is a negative number'}      | ${'-100'}
      ${'has less than four digits'} | ${'123'}
      ${'has more than four digits'} | ${'12345'}
    `('should set payment date error when year $description', ({ yearValue }: { yearValue: string }) => {
      // Arrange
      const formValues: EditPaymentFormValues = {
        ...aValidSetOfFormValues(),
        paymentDate: { day: '1', month: '1', year: yearValue },
      };

      // Act
      const errors = validateEditPaymentRequestFormValues(formValues);

      // Assert
      expect(errors.errorSummary).toEqual([{ text: 'The date payment received must be a real date', href: '#paymentDate-year' }]);
      expect(errors.paymentDateError).toEqual<PaymentDateErrorViewModel>({
        message: 'The date payment received must be a real date',
        dayError: false,
        monthError: false,
        yearError: true,
      });
    });

    it('should set payment date error if day is between 1 and 31 and month between 1 and 12 and year four digits but date is not a real date', () => {
      // Arrange
      const formValues: EditPaymentFormValues = {
        ...aValidSetOfFormValues(),
        paymentDate: { day: '31', month: '2', year: '2023' },
      };

      // Act
      const errors = validateEditPaymentRequestFormValues(formValues);

      // Assert
      expect(errors.errorSummary).toEqual([{ text: 'The date payment received must be a real date', href: '#paymentDate-day' }]);
      expect(errors.paymentDateError).toEqual<PaymentDateErrorViewModel>({
        message: 'The date payment received must be a real date',
        dayError: true,
        monthError: true,
        yearError: true,
      });
    });

    it('should set payment date error if payment date is not in the past', () => {
      // Arrange
      const today = new Date();
      const formValues: EditPaymentFormValues = {
        ...aValidSetOfFormValues(),
        paymentDate: { day: today.getDate().toString(), month: (today.getMonth() + 1).toString(), year: today.getFullYear().toString() },
      };

      // Act
      const errors = validateEditPaymentRequestFormValues(formValues);

      // Assert
      expect(errors.errorSummary).toEqual([{ text: 'The date payment received must be in the past', href: '#paymentDate-day' }]);
      expect(errors.paymentDateError).toEqual<PaymentDateErrorViewModel>({
        message: 'The date payment received must be in the past',
        dayError: true,
        monthError: true,
        yearError: true,
      });
    });

    it('should not set payment date error if payment date is in the past', () => {
      // Arrange
      const today = new Date();
      const yesterday = subDays(today, 1);
      const formValues: EditPaymentFormValues = {
        ...aValidSetOfFormValues(),
        paymentDate: { day: yesterday.getDate().toString(), month: (yesterday.getMonth() + 1).toString(), year: yesterday.getFullYear().toString() },
      };

      // Act
      const errors = validateEditPaymentRequestFormValues(formValues);

      // Assert
      expect(errors.errorSummary.length).toEqual(0);
      expect(errors.paymentDateError).toEqual(undefined);
    });

    it('when there are multiple errors should include all errors in error summary', () => {
      // Arrange
      const formValues: EditPaymentFormValues = { paymentDate: {} };

      // Act
      const errors = validateEditPaymentRequestFormValues(formValues);

      // Assert
      expect(errors.errorSummary).toEqual([
        { text: 'Enter a valid amount received', href: '#paymentAmount' },
        { text: 'Enter the date payment received', href: '#paymentDate-day' },
      ]);
    });

    function aValidSetOfFormValues(): EditPaymentFormValues {
      return {
        paymentAmount: '100.00',
        paymentDate: {
          day: '11',
          month: '11',
          year: '1111',
        },
        paymentReference: 'REFERENCE',
      };
    }
  });

  describe('validateAddToAnExistingPaymentRequestFormValues', () => {
    it('should return error when no payment radio is selected', () => {
      // Arrange
      const paymentRadioIds: number[] = [];

      // Act
      const result = validateAddToAnExistingPaymentRequestFormValues(paymentRadioIds);

      // Assert
      expect(result.errorSummary).toEqual([{ text: 'Select a payment to add the fee or fees to', href: '#payment-groups' }]);
      expect(result.paymentGroupErrorMessage).toEqual('Select a payment to add the fee or fees to');
    });

    it('should not return error when a payment radio is selected', () => {
      // Arrange
      const paymentRadioIds: number[] = [1];

      // Act
      const result = validateAddToAnExistingPaymentRequestFormValues(paymentRadioIds);

      // Assert
      expect(result.errorSummary).toEqual([]);
      expect(result.paymentGroupErrorMessage).toBeUndefined();
    });

    it('should not return error when multiple payments are selected', () => {
      // Arrange
      const paymentRadioIds: number[] = [7, 8, 9];

      // Act
      const result = validateAddToAnExistingPaymentRequestFormValues(paymentRadioIds);

      // Assert
      expect(result.errorSummary).toEqual([]);
      expect(result.paymentGroupErrorMessage).toBeUndefined();
    });
  });
});
