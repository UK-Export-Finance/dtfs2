import { ADD_PAYMENT_ERROR_KEY, GENERATE_KEYING_DATA_ERROR_KEY, INITIATE_RECORD_CORRECTION_ERROR_KEY } from '../../../constants/premium-payment-tab-error-keys';
import { AddPaymentErrorKey, GenerateKeyingDataErrorKey, InitiateRecordCorrectionRequestErrorKey } from '../../../types/premium-payments-tab-error-keys';
import { handleRedirectSessionData } from './handle-redirect-session-data';

type RedirectSessionData = {
  addPaymentErrorKey?: AddPaymentErrorKey;
  generateKeyingDataErrorKey?: GenerateKeyingDataErrorKey;
  initiateRecordCorrectionRequestErrorKey?: InitiateRecordCorrectionRequestErrorKey;
  checkedCheckboxIds?: Record<string, true | undefined>;
};

describe('handleRedirectSessionData', () => {
  const getSessionData = ({
    addPaymentErrorKey,
    generateKeyingDataErrorKey,
    initiateRecordCorrectionRequestErrorKey,
    checkedCheckboxIds,
  }: Partial<RedirectSessionData>) => ({
    addPaymentErrorKey,
    generateKeyingDataErrorKey,
    initiateRecordCorrectionRequestErrorKey,
    checkedCheckboxIds,
  });

  it('returns an undefined premiumPaymentsTableDataError when the session error keys are undefined', () => {
    // Arrange
    const sessionData = getSessionData({});

    // Act
    const { premiumPaymentsTableDataError } = handleRedirectSessionData(sessionData);

    // Assert
    expect(premiumPaymentsTableDataError).toBeUndefined();
  });

  it('returns an empty selectedFeeRecordIds set when the session error keys are undefined', () => {
    // Arrange
    const sessionData = getSessionData({});

    // Act
    const { selectedFeeRecordIds } = handleRedirectSessionData(sessionData);

    // Assert
    expect(selectedFeeRecordIds).toEqual(new Set());
  });

  it('throws an error if the session generateKeyingDataErrorKey is not recognised', () => {
    // Arrange
    const invalidGenerateKeyingDataError = 'invalid-error' as GenerateKeyingDataErrorKey;
    const sessionData = getSessionData({
      generateKeyingDataErrorKey: invalidGenerateKeyingDataError,
    });

    // Act / Assert
    expect(() => handleRedirectSessionData(sessionData)).toThrow(Error);
  });

  it(`returns the premiumPaymentsTableDataError when the generateKeyingDataErrorKey is '${GENERATE_KEYING_DATA_ERROR_KEY.NO_MATCHING_FEE_RECORDS}'`, () => {
    // Arrange
    const sessionData = getSessionData({
      generateKeyingDataErrorKey: GENERATE_KEYING_DATA_ERROR_KEY.NO_MATCHING_FEE_RECORDS,
    });

    // Act
    const { premiumPaymentsTableDataError } = handleRedirectSessionData(sessionData);

    // Assert
    expect(premiumPaymentsTableDataError?.text).toBeDefined();
    expect(premiumPaymentsTableDataError?.href).toBeDefined();
  });

  it('throws an error if the session addPaymentErrorKey is not recognised', () => {
    // Arrange
    const invalidAddPaymentError = 'invalid-error' as AddPaymentErrorKey;
    const sessionData = getSessionData({
      addPaymentErrorKey: invalidAddPaymentError,
    });

    // Act / Assert
    expect(() => handleRedirectSessionData(sessionData)).toThrow(Error);
  });

  it.each(Object.values(ADD_PAYMENT_ERROR_KEY))("returns the premiumPaymentsTableDataError when the addPaymentErrorKey is '%s'", (addPaymentErrorKey) => {
    // Arrange
    const sessionData = getSessionData({
      addPaymentErrorKey,
      checkedCheckboxIds: {},
    });

    // Act
    const { premiumPaymentsTableDataError } = handleRedirectSessionData(sessionData);

    // Assert
    expect(premiumPaymentsTableDataError?.text).toBeDefined();
    expect(premiumPaymentsTableDataError?.href).toBeDefined();
  });

  it('returns a set of fee record ids for checked checkbox ids defined in the sessions checkedCheckboxIds when addPaymentErrorKey is provided', () => {
    // Arrange
    const checkedCheckboxId = 'feeRecordIds-1-reportedPaymentsCurrency-GBP-status-TO_DO';

    const sessionData = getSessionData({
      addPaymentErrorKey: ADD_PAYMENT_ERROR_KEY.DIFFERENT_STATUSES,
      checkedCheckboxIds: {
        [checkedCheckboxId]: true,
      },
    });

    // Act
    const { selectedFeeRecordIds } = handleRedirectSessionData(sessionData);

    // Assert
    expect(selectedFeeRecordIds).toEqual(new Set([1]));
  });

  it('throws an error if the session initiateRecordCorrectionRequestErrorKey is not recognised', () => {
    // Arrange
    const invalidErrorKey = 'invalid-error' as InitiateRecordCorrectionRequestErrorKey;
    const sessionData = getSessionData({
      initiateRecordCorrectionRequestErrorKey: invalidErrorKey,
    });

    // Act / Assert
    expect(() => handleRedirectSessionData(sessionData)).toThrow(Error);
  });

  it.each(Object.values(INITIATE_RECORD_CORRECTION_ERROR_KEY))(
    "returns the premiumPaymentsTableDataError when the initiateRecordCorrectionRequestErrorKey is '%s'",
    (initiateRecordCorrectionRequestErrorKey) => {
      // Arrange
      const sessionData = getSessionData({
        initiateRecordCorrectionRequestErrorKey,
        checkedCheckboxIds: {},
      });

      // Act
      const { premiumPaymentsTableDataError } = handleRedirectSessionData(sessionData);

      // Assert
      expect(premiumPaymentsTableDataError?.text).toBeDefined();
      expect(premiumPaymentsTableDataError?.href).toBeDefined();
    },
  );

  it('returns a set of fee record ids for checked checkbox ids defined in the sessions checkedCheckboxIds when initiateRecordCorrectionRequestErrorKey is provided', () => {
    // Arrange
    const checkedCheckboxId = 'feeRecordIds-1-reportedPaymentsCurrency-GBP-status-TO_DO';

    const sessionData = getSessionData({
      initiateRecordCorrectionRequestErrorKey: INITIATE_RECORD_CORRECTION_ERROR_KEY.NO_FEE_RECORDS_SELECTED,
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
