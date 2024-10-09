import { Currency } from '@ukef/dtfs2-common';
import { parseValidatedAddPaymentFormValues, parseValidatedEditPaymentFormValues } from './parse-payment-form-values';
import { ValidatedAddPaymentFormValues } from '../../../types/add-payment-form-values';
import { ValidatedEditPaymentFormValues } from '../../../types/edit-payment-form-values';

describe('parseValidatedAddPaymentFormValues', () => {
  const aValidatedAddPaymentFormValuesObject = (): Omit<ValidatedAddPaymentFormValues, 'addAnotherPayment'> => ({
    paymentCurrency: 'GBP',
    paymentDate: {
      day: '12',
      month: '5',
      year: '2024',
    },
    paymentAmount: '100',
    paymentReference: 'A payment reference',
  });

  it('returns an object containing the supplied payment currency', () => {
    // Arrange
    const paymentCurrency: Currency = 'EUR';
    const formValues = {
      ...aValidatedAddPaymentFormValuesObject(),
      paymentCurrency,
    };

    // Act
    const parsedFormValues = parseValidatedAddPaymentFormValues(formValues);

    // Assert
    expect(parsedFormValues.paymentCurrency).toEqual(paymentCurrency);
  });

  it('returns an object containing the supplied payment reference', () => {
    // Arrange
    const paymentReference = 'Some payment reference';
    const formValues = {
      ...aValidatedAddPaymentFormValuesObject(),
      paymentReference,
    };

    // Act
    const parsedFormValues = parseValidatedAddPaymentFormValues(formValues);

    // Assert
    expect(parsedFormValues.paymentReference).toEqual(paymentReference);
  });

  it('parses the supplied payment date to a date object', () => {
    // Arrange
    const parsedPaymentDate = new Date('2024-3-2');
    const paymentDate: ValidatedAddPaymentFormValues['paymentDate'] = {
      day: '2',
      month: '3',
      year: '2024',
    };

    const formValues = {
      ...aValidatedAddPaymentFormValuesObject(),
      paymentDate,
    };

    // Act
    const parsedFormValues = parseValidatedAddPaymentFormValues(formValues);

    // Assert
    expect(parsedFormValues.datePaymentReceived).toEqual(parsedPaymentDate);
  });

  it('parses the supplied payment amount to a number when the amount does not contain any commas or decimals', () => {
    // Arrange
    const paymentAmount = 100;
    const paymentAmountAsString = paymentAmount.toString();

    const formValues = {
      ...aValidatedAddPaymentFormValuesObject(),
      paymentAmount: paymentAmountAsString,
    };

    // Act
    const parsedFormValues = parseValidatedAddPaymentFormValues(formValues);

    // Assert
    expect(parsedFormValues.paymentAmount).toEqual(paymentAmount);
  });

  it('parses the supplied payment amount to a number when the amount does not contain any commas but has decimals', () => {
    // Arrange
    const paymentAmount = 123.45;
    const paymentAmountAsString = paymentAmount.toString();

    const formValues = {
      ...aValidatedAddPaymentFormValuesObject(),
      paymentAmount: paymentAmountAsString,
    };

    // Act
    const parsedFormValues = parseValidatedAddPaymentFormValues(formValues);

    // Assert
    expect(parsedFormValues.paymentAmount).toEqual(paymentAmount);
  });

  it('parses the supplied payment amount to a number when the amount does not contain decimals but has commas', () => {
    // Arrange
    const paymentAmount = 1234567;
    const paymentAmountAsString = '1,234,567';

    const formValues = {
      ...aValidatedAddPaymentFormValuesObject(),
      paymentAmount: paymentAmountAsString,
    };

    // Act
    const parsedFormValues = parseValidatedAddPaymentFormValues(formValues);

    // Assert
    expect(parsedFormValues.paymentAmount).toEqual(paymentAmount);
  });

  it('parses the supplied payment amount to a number when the amount contains commas and decimals', () => {
    // Arrange
    const paymentAmount = 1234567.89;
    const paymentAmountAsString = '1,234,567.89';

    const formValues = {
      ...aValidatedAddPaymentFormValuesObject(),
      paymentAmount: paymentAmountAsString,
    };

    // Act
    const parsedFormValues = parseValidatedAddPaymentFormValues(formValues);

    // Assert
    expect(parsedFormValues.paymentAmount).toEqual(paymentAmount);
  });
});

describe('parseValidatedEditPaymentFormValues', () => {
  it('sets the paymentAmount field to a number matching the supplied paymentAmount', () => {
    // Arrange
    const validatedFormValues: ValidatedEditPaymentFormValues = {
      ...aValidatedEditPaymentFormValueSet(),
      paymentAmount: '314.59',
    };

    // Act
    const result = parseValidatedEditPaymentFormValues(validatedFormValues);

    // Assert
    expect(result.paymentAmount).toEqual(314.59);
  });

  it('sets the datePaymentReceived field to a date matching the supplied paymentDate object', () => {
    // Arrange
    const validatedFormValues: ValidatedEditPaymentFormValues = {
      ...aValidatedEditPaymentFormValueSet(),
      paymentDate: {
        day: '12',
        month: '5',
        year: '2024',
      },
    };

    // Act
    const result = parseValidatedEditPaymentFormValues(validatedFormValues);

    // Assert
    expect(result.datePaymentReceived).toEqual(new Date('2024-5-12'));
  });

  it('sets the paymentReference field to the supplied paymentReference string', () => {
    // Arrange
    const validatedFormValues: ValidatedEditPaymentFormValues = {
      ...aValidatedEditPaymentFormValueSet(),
      paymentReference: 'A payment reference',
    };

    // Act
    const result = parseValidatedEditPaymentFormValues(validatedFormValues);

    // Assert
    expect(result.paymentReference).toEqual('A payment reference');
  });

  it('sets the paymentReference field to null when the supplied paymentReference is undefined', () => {
    // Arrange
    const validatedFormValues: ValidatedEditPaymentFormValues = {
      ...aValidatedEditPaymentFormValueSet(),
      paymentReference: undefined,
    };

    // Act
    const result = parseValidatedEditPaymentFormValues(validatedFormValues);

    // Assert
    expect(result.paymentReference).toBeNull();
  });

  function aValidatedEditPaymentFormValueSet(): ValidatedEditPaymentFormValues {
    return {
      paymentAmount: '100',
      paymentDate: {
        day: '1',
        month: '12',
        year: '2024',
      },
      paymentReference: 'A payment reference',
    };
  }
});
