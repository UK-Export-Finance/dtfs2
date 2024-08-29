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

  it('clears the session and returns an undefined tableError when the session error keys are undefined', () => {
    // Arrange
    const req = getMockRequest({
      addPaymentErrorKey: undefined,
      generateKeyingDataErrorKey: undefined,
    });

    // Act
    const { tableError } = getAndClearFieldsFromRedirectSessionData(req);

    // Assert
    assertSessionHasBeenCleared(req);
    expect(tableError).toBeUndefined();
  });

  it('clears the session and returns an empty selectedFeeRecordIds set when the session error keys are undefined', () => {
    // Arrange
    const req = getMockRequest({
      addPaymentErrorKey: undefined,
      generateKeyingDataErrorKey: undefined,
    });

    // Act
    const { selectedFeeRecordIds } = getAndClearFieldsFromRedirectSessionData(req);

    // Assert
    assertSessionHasBeenCleared(req);
    expect(selectedFeeRecordIds).toEqual(new Set());
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

  it("clears the session and returns the tableError when the generateKeyingDataErrorKey is 'no-matching-fee-records'", () => {
    // Arrange
    const req = getMockRequest({
      addPaymentErrorKey: undefined,
      generateKeyingDataErrorKey: 'no-matching-fee-records',
    });

    // Act
    const { tableError } = getAndClearFieldsFromRedirectSessionData(req);

    // Assert
    assertSessionHasBeenCleared(req);
    expect(tableError?.text).toBeDefined();
    expect(tableError?.href).toBeDefined();
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
  ])("clears the session and returns the tableError when the addPaymentErrorKey is '%s'", (addPaymentErrorKey) => {
    // Arrange
    const req = getMockRequest({
      addPaymentErrorKey,
      generateKeyingDataErrorKey: undefined,
      checkedCheckboxIds: {},
    });

    // Act
    const { tableError } = getAndClearFieldsFromRedirectSessionData(req);

    // Assert
    assertSessionHasBeenCleared(req);
    expect(tableError?.text).toBeDefined();
    expect(tableError?.href).toBeDefined();
  });

  it('returns a set of fee record ids for checked checkbox ids defined in req.session.checkedCheckboxIds', () => {
    // Arrange
    const checkedCheckboxId = 'feeRecordIds-1-reportedPaymentsCurrency-GBP-status-TO_DO';

    const req = getMockRequest({
      addPaymentErrorKey: 'different-fee-record-statuses',
      generateKeyingDataErrorKey: undefined,
      checkedCheckboxIds: {
        [checkedCheckboxId]: true,
      },
    });

    // Act
    const { selectedFeeRecordIds } = getAndClearFieldsFromRedirectSessionData(req);

    // Assert
    assertSessionHasBeenCleared(req);
    expect(selectedFeeRecordIds).toEqual(new Set([1]));
  });
});
