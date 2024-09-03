import { handleRedirectSessionData } from './handle-redirect-session-data';
import { AddPaymentErrorKey, GenerateKeyingDataErrorKey } from '../helpers';

type RedirectSessionData = {
  addPaymentErrorKey: AddPaymentErrorKey | undefined;
  generateKeyingDataErrorKey: GenerateKeyingDataErrorKey | undefined;
  checkedCheckboxIds?: Record<string, true | undefined>;
};

describe('handleRedirectSessionData', () => {
  const getSessionData = ({ addPaymentErrorKey, generateKeyingDataErrorKey, checkedCheckboxIds }: RedirectSessionData) => ({
    addPaymentErrorKey,
    generateKeyingDataErrorKey,
    checkedCheckboxIds,
  });

  it('returns an undefined tableDataError when the session error keys are undefined', () => {
    // Arrange
    const sessionData = getSessionData({
      addPaymentErrorKey: undefined,
      generateKeyingDataErrorKey: undefined,
    });

    // Act
    const { tableDataError } = handleRedirectSessionData(sessionData);

    // Assert
    expect(tableDataError).toBeUndefined();
  });

  it('returns an empty selectedFeeRecordIds set when the session error keys are undefined', () => {
    // Arrange
    const sessionData = getSessionData({
      addPaymentErrorKey: undefined,
      generateKeyingDataErrorKey: undefined,
    });

    // Act
    const { selectedFeeRecordIds } = handleRedirectSessionData(sessionData);

    // Assert
    expect(selectedFeeRecordIds).toEqual(new Set());
  });

  it('throws an error if the session generateKeyingDataErrorKey is not recognised', () => {
    // Arrange
    const invalidGenerateKeyingDataError = 'invalid-error' as GenerateKeyingDataErrorKey;
    const sessionData = getSessionData({
      addPaymentErrorKey: undefined,
      generateKeyingDataErrorKey: invalidGenerateKeyingDataError,
    });

    // Act / Assert
    expect(() => handleRedirectSessionData(sessionData)).toThrow(Error);
  });

  it("returns the tableDataError when the generateKeyingDataErrorKey is 'no-matching-fee-records'", () => {
    // Arrange
    const sessionData = getSessionData({
      addPaymentErrorKey: undefined,
      generateKeyingDataErrorKey: 'no-matching-fee-records',
    });

    // Act
    const { tableDataError } = handleRedirectSessionData(sessionData);

    // Assert
    expect(tableDataError?.text).toBeDefined();
    expect(tableDataError?.href).toBeDefined();
  });

  it('throws an error if the session addPaymentErrorKey is not recognised', () => {
    // Arrange
    const invalidAddPaymentError = 'invalid-error' as AddPaymentErrorKey;
    const sessionData = getSessionData({
      addPaymentErrorKey: invalidAddPaymentError,
      generateKeyingDataErrorKey: undefined,
    });

    // Act / Assert
    expect(() => handleRedirectSessionData(sessionData)).toThrow(Error);
  });

  it.each<AddPaymentErrorKey>([
    'different-fee-record-statuses',
    'multiple-does-not-match-selected',
    'no-fee-records-selected',
    'different-fee-record-payment-currencies',
  ])("returns the tableDataError when the addPaymentErrorKey is '%s'", (addPaymentErrorKey) => {
    // Arrange
    const sessionData = getSessionData({
      addPaymentErrorKey,
      generateKeyingDataErrorKey: undefined,
      checkedCheckboxIds: {},
    });

    // Act
    const { tableDataError } = handleRedirectSessionData(sessionData);

    // Assert
    expect(tableDataError?.text).toBeDefined();
    expect(tableDataError?.href).toBeDefined();
  });

  it('returns a set of fee record ids for checked checkbox ids defined in the sessions checkedCheckboxIds', () => {
    // Arrange
    const checkedCheckboxId = 'feeRecordIds-1-reportedPaymentsCurrency-GBP-status-TO_DO';

    const sessionData = getSessionData({
      addPaymentErrorKey: 'different-fee-record-statuses',
      generateKeyingDataErrorKey: undefined,
      checkedCheckboxIds: {
        [checkedCheckboxId]: true,
      },
    });

    // Act
    const { selectedFeeRecordIds } = handleRedirectSessionData(sessionData);

    // Assert
    expect(selectedFeeRecordIds).toEqual(new Set([1]));
  });
});
