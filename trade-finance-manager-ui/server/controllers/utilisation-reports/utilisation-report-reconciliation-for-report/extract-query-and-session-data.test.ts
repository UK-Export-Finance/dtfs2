import { extractQueryAndSessionData } from './extract-query-and-session-data';
import { handleRedirectSessionData } from './handle-redirect-session-data';
import { validatePaymentDetailsFilters } from './validate-payment-details-filters';
import { validateFacilityIdQuery } from './validate-premium-payments-filters';

jest.mock('./handle-redirect-session-data');
jest.mock('./validate-premium-payments-filters');
jest.mock('./validate-payment-details-filters');

describe('extractQueryAndSessionData', () => {
  const ORIGINAL_URL = '/original-url';

  beforeEach(() => {
    jest.resetAllMocks();

    jest.mocked(handleRedirectSessionData).mockReturnValue({
      selectedFeeRecordIds: new Set(),
    });
  });

  describe('premium payments filters', () => {
    const PREMIUM_PAYMENTS_FACILITY_ID_QUERY = '1234';

    describe('when extracting facility id filter', () => {
      it('should use provided premiumPaymentsFacilityId', () => {
        // Arrange
        const queryParams = {
          premiumPaymentsFacilityId: PREMIUM_PAYMENTS_FACILITY_ID_QUERY,
        };
        const sessionData = {};

        // Act
        const result = extractQueryAndSessionData(queryParams, sessionData, ORIGINAL_URL);

        // Assert
        expect(result.premiumPaymentsFilters.facilityId).toBe(PREMIUM_PAYMENTS_FACILITY_ID_QUERY);
      });

      it('should validate premiumPaymentsFacilityId and return any errors as premiumPaymentsFilterErrors', () => {
        // Arrange
        const queryParams = {
          premiumPaymentsFacilityId: PREMIUM_PAYMENTS_FACILITY_ID_QUERY,
        };
        const sessionData = {};

        const mockError = { text: 'Error text', href: '#test-error' };
        jest.mocked(validateFacilityIdQuery).mockReturnValue(mockError);

        // Act
        const result = extractQueryAndSessionData(queryParams, sessionData, ORIGINAL_URL);

        // Assert
        expect(validateFacilityIdQuery).toHaveBeenCalledWith(ORIGINAL_URL, PREMIUM_PAYMENTS_FACILITY_ID_QUERY);
        expect(result.premiumPaymentsFilterError).toEqual(mockError);
      });
    });

    it('uses premiumPaymentsTableDataError derived from session data', () => {
      // Arrange
      const queryParams = {
        premiumPaymentsFacilityId: PREMIUM_PAYMENTS_FACILITY_ID_QUERY,
      };
      const sessionData = {};

      const mockTableDataError = { text: 'Test error', href: '#test-error' };
      jest.mocked(handleRedirectSessionData).mockReturnValue({
        premiumPaymentsTableDataError: mockTableDataError,
        selectedFeeRecordIds: new Set(),
      });

      // Act
      const result = extractQueryAndSessionData(queryParams, sessionData, ORIGINAL_URL);

      // Assert
      expect(handleRedirectSessionData).toHaveBeenCalledWith({});
      expect(result.premiumPaymentsTableDataError).toEqual(mockTableDataError);
    });
  });

  describe('payment details filters', () => {
    const PAYMENT_DETAILS_FACILITY_ID_QUERY = '5678';
    const PAYMENT_DETAILS_PAYMENT_CURRENCY_QUERY = 'GBP';
    const PAYMENT_DETAILS_PAYMENT_REFERENCE_QUERY = 'some-payment-reference';

    describe('when extracting facility id filter', () => {
      it('should use provided paymentDetailsFacilityId', () => {
        // Arrange
        const queryParams = {
          paymentDetailsFacilityId: PAYMENT_DETAILS_FACILITY_ID_QUERY,
        };
        const sessionData = {};

        // Act
        const result = extractQueryAndSessionData(queryParams, sessionData, ORIGINAL_URL);

        // Assert
        expect(result.paymentDetailsFilters.facilityId).toBe(PAYMENT_DETAILS_FACILITY_ID_QUERY);
      });

      it('should validate paymentDetailsFacilityId and return any errors as paymentDetailsFilterErrors', () => {
        // Arrange
        const queryParams = {
          paymentDetailsFacilityId: PAYMENT_DETAILS_FACILITY_ID_QUERY,
        };
        const sessionData = {};

        const mockError = { text: 'Error text', href: '#test-error' };
        const mockErrorsViewModel = {
          errorSummary: [mockError],
          facilityIdErrorMessage: mockError.text,
        };
        jest.mocked(validatePaymentDetailsFilters).mockReturnValue(mockErrorsViewModel);

        // Act
        const result = extractQueryAndSessionData(queryParams, sessionData, ORIGINAL_URL);

        // Assert
        expect(validatePaymentDetailsFilters).toHaveBeenCalledWith(ORIGINAL_URL, { facilityId: PAYMENT_DETAILS_FACILITY_ID_QUERY });
        expect(result.paymentDetailsFilterErrors).toEqual(mockErrorsViewModel);
      });
    });

    describe('when extracting payment currency filter', () => {
      it('should use provided paymentDetailsPaymentCurrency', () => {
        // Arrange
        const queryParams = {
          paymentDetailsPaymentCurrency: PAYMENT_DETAILS_PAYMENT_CURRENCY_QUERY,
        };
        const sessionData = {};

        // Act
        const result = extractQueryAndSessionData(queryParams, sessionData, ORIGINAL_URL);

        // Assert
        expect(result.paymentDetailsFilters.paymentCurrency).toBe(PAYMENT_DETAILS_PAYMENT_CURRENCY_QUERY);
      });

      it('should validate paymentDetailsPaymentCurrency and return any errors as paymentDetailsFilterErrors', () => {
        // Arrange
        const queryParams = {
          paymentDetailsPaymentCurrency: PAYMENT_DETAILS_PAYMENT_CURRENCY_QUERY,
        };
        const sessionData = {};

        const mockError = { text: 'Error text', href: '#test-error' };
        const mockErrorsViewModel = {
          errorSummary: [mockError],
          paymentCurrencyErrorMessage: mockError.text,
        };
        jest.mocked(validatePaymentDetailsFilters).mockReturnValue(mockErrorsViewModel);

        // Act
        const result = extractQueryAndSessionData(queryParams, sessionData, ORIGINAL_URL);

        // Assert
        expect(validatePaymentDetailsFilters).toHaveBeenCalledWith(ORIGINAL_URL, { paymentCurrency: PAYMENT_DETAILS_PAYMENT_CURRENCY_QUERY });
        expect(result.paymentDetailsFilterErrors).toEqual(mockErrorsViewModel);
      });
    });

    describe('when extracting payment reference filter', () => {
      it('should use provided paymentDetailsPaymentReference', () => {
        // Arrange
        const queryParams = {
          paymentDetailsPaymentReference: PAYMENT_DETAILS_PAYMENT_REFERENCE_QUERY,
        };
        const sessionData = {};

        // Act
        const result = extractQueryAndSessionData(queryParams, sessionData, ORIGINAL_URL);

        // Assert
        expect(result.paymentDetailsFilters.paymentReference).toBe(PAYMENT_DETAILS_PAYMENT_REFERENCE_QUERY);
      });

      it('should validate paymentDetailsPaymentReference and return any errors as paymentDetailsFilterErrors', () => {
        // Arrange
        const queryParams = {
          paymentDetailsPaymentReference: PAYMENT_DETAILS_PAYMENT_REFERENCE_QUERY,
        };
        const sessionData = {};

        const mockError = { text: 'Error text', href: '#test-error' };
        const mockErrorsViewModel = {
          errorSummary: [mockError],
          paymentReferenceErrorMessage: mockError.text,
        };
        jest.mocked(validatePaymentDetailsFilters).mockReturnValue(mockErrorsViewModel);

        // Act
        const result = extractQueryAndSessionData(queryParams, sessionData, ORIGINAL_URL);

        // Assert
        expect(validatePaymentDetailsFilters).toHaveBeenCalledWith(ORIGINAL_URL, { paymentReference: PAYMENT_DETAILS_PAYMENT_REFERENCE_QUERY });
        expect(result.paymentDetailsFilterErrors).toEqual(mockErrorsViewModel);
      });
    });
  });

  describe('when selectedFeeRecordIds are present in query', () => {
    it('should use them for isCheckboxChecked', () => {
      // Arrange
      const queryParams = {
        selectedFeeRecordIdsQuery: '1,2,3',
      };
      const sessionData = {};

      // Act
      const result = extractQueryAndSessionData(queryParams, sessionData, ORIGINAL_URL);

      // Assert
      expect(result.isCheckboxChecked([1])).toBe(true);
      expect(result.isCheckboxChecked([2, 3])).toBe(true);
      expect(result.isCheckboxChecked([4])).toBe(false);
    });
  });

  describe('when selectedFeeRecordIds are present in session data', () => {
    it('should use them for isCheckboxChecked', () => {
      // Arrange
      const queryParams = {};
      const sessionData = {};

      jest.mocked(handleRedirectSessionData).mockReturnValue({
        premiumPaymentsTableDataError: undefined,
        selectedFeeRecordIds: new Set([1, 2, 3]),
      });

      // Act
      const result = extractQueryAndSessionData(queryParams, sessionData, ORIGINAL_URL);

      // Assert
      expect(handleRedirectSessionData).toHaveBeenCalledWith({});
      expect(result.isCheckboxChecked([1])).toBe(true);
      expect(result.isCheckboxChecked([2, 3])).toBe(true);
      expect(result.isCheckboxChecked([4])).toBe(false);
    });
  });
});
