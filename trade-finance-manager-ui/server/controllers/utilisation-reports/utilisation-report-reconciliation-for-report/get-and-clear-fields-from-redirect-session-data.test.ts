import { createRequest } from 'node-mocks-http';
import { getAndClearFieldsFromRedirectSessionData } from './get-and-clear-fields-from-redirect-session-data';
import { AddPaymentErrorKey, GenerateKeyingDataErrorKey } from '../helpers';

type RedirectSessionData = {
  addPaymentErrorKey: AddPaymentErrorKey | undefined;
  generateKeyingDataErrorKey: GenerateKeyingDataErrorKey | undefined;
  checkedCheckboxIds?: Record<string, true | undefined>;
};

describe('getAndClearFieldsFromRedirectSessionData', () => {
  const getMockRequest = ({ addPaymentErrorKey, generateKeyingDataErrorKey, checkedCheckboxIds }: RedirectSessionData) =>
    createRequest({
      session: {
        addPaymentErrorKey,
        generateKeyingDataErrorKey,
        checkedCheckboxIds,
      },
    });

  const assertSessionHasBeenCleared = (req: ReturnType<typeof getMockRequest>) => {
    expect(req.session.addPaymentErrorKey).toBeUndefined();
    expect(req.session.checkedCheckboxIds).toBeUndefined();
    expect(req.session.generateKeyingDataErrorKey).toBeUndefined();
  };

  const assertIsCheckboxCheckedReturnsValueWithInput = (isCheckboxChecked: (checkboxId: string) => boolean, input: string, expectedOutput: boolean) => {
    expect(isCheckboxChecked(input)).toBe(expectedOutput);
  };

  it('clears the session and returns an undefined errorSummary when the session error keys are undefined', () => {
    // Arrange
    const req = getMockRequest({
      addPaymentErrorKey: undefined,
      generateKeyingDataErrorKey: undefined,
    });

    // Act
    const { errorSummary } = getAndClearFieldsFromRedirectSessionData(req);

    // Assert
    assertSessionHasBeenCleared(req);
    expect(errorSummary).toBeUndefined();
  });

  it('clears the session and returns a default isCheckboxChecked function when the session error keys are undefined', () => {
    // Arrange
    const req = getMockRequest({
      addPaymentErrorKey: undefined,
      generateKeyingDataErrorKey: undefined,
    });

    // Act
    const { isCheckboxChecked } = getAndClearFieldsFromRedirectSessionData(req);

    // Assert
    assertSessionHasBeenCleared(req);
    assertIsCheckboxCheckedReturnsValueWithInput(isCheckboxChecked, '', false);
  });

  it('throws an error if the session generateKeyingDataErrorKey is not recognised', () => {
    // Arrange
    const invalidGenerateKeyingDataError = 'invalid-error' as GenerateKeyingDataErrorKey;
    const req = getMockRequest({
      addPaymentErrorKey: undefined,
      generateKeyingDataErrorKey: invalidGenerateKeyingDataError,
    });

    // Act / Assert
    expect(() => getAndClearFieldsFromRedirectSessionData(req)).toThrow(Error);
    assertSessionHasBeenCleared(req);
  });

  it("clears the session and returns the errorSummary when the generateKeyingDataErrorKey is 'no-matching-fee-records'", () => {
    // Arrange
    const req = getMockRequest({
      addPaymentErrorKey: undefined,
      generateKeyingDataErrorKey: 'no-matching-fee-records',
    });

    // Act
    const { errorSummary } = getAndClearFieldsFromRedirectSessionData(req);

    // Assert
    assertSessionHasBeenCleared(req);
    expect(errorSummary?.text).toBeDefined();
    expect(errorSummary?.href).toBeDefined();
  });

  it('throws an error if the session addPaymentErrorKey is not recognised', () => {
    // Arrange
    const invalidAddPaymentError = 'invalid-error' as AddPaymentErrorKey;
    const req = getMockRequest({
      addPaymentErrorKey: invalidAddPaymentError,
      generateKeyingDataErrorKey: undefined,
    });

    // Act / Assert
    expect(() => getAndClearFieldsFromRedirectSessionData(req)).toThrow(Error);
    assertSessionHasBeenCleared(req);
  });

  it.each<AddPaymentErrorKey>([
    'different-fee-record-statuses',
    'multiple-does-not-match-selected',
    'no-fee-records-selected',
    'different-fee-record-payment-currencies',
  ])("clears the session and returns the errorSummary when the addPaymentErrorKey is '%s'", (addPaymentErrorKey) => {
    // Arrange
    const req = getMockRequest({
      addPaymentErrorKey,
      generateKeyingDataErrorKey: undefined,
      checkedCheckboxIds: {},
    });

    // Act
    const { errorSummary } = getAndClearFieldsFromRedirectSessionData(req);

    // Assert
    assertSessionHasBeenCleared(req);
    expect(errorSummary?.text).toBeDefined();
    expect(errorSummary?.href).toBeDefined();
  });

  it('returns a function which returns true for a checkbox id defined in req.session.checkedCheckboxIds and false otherwise', () => {
    // Arrange
    const checkedCheckboxId = 'some-checkbox-id';
    const uncheckedCheckboxId = 'another-checkbox-id';

    const req = getMockRequest({
      addPaymentErrorKey: 'different-fee-record-statuses',
      generateKeyingDataErrorKey: undefined,
      checkedCheckboxIds: {
        [checkedCheckboxId]: true,
      },
    });

    // Act
    const { isCheckboxChecked } = getAndClearFieldsFromRedirectSessionData(req);

    // Assert
    assertSessionHasBeenCleared(req);
    assertIsCheckboxCheckedReturnsValueWithInput(isCheckboxChecked, checkedCheckboxId, true);
    assertIsCheckboxCheckedReturnsValueWithInput(isCheckboxChecked, uncheckedCheckboxId, false);
  });
});
