import { extractQueryAndSessionData } from './extract-query-and-session-data';
import { handleRedirectSessionData } from './handle-redirect-session-data';
import { validateFacilityIdQuery } from './validate-facility-id-query';

jest.mock('./handle-redirect-session-data');
jest.mock('./validate-facility-id-query');

describe('extractQueryAndSessionData', () => {
  const ORIGINAL_URL = '/original-url';
  const PREMIUM_PAYMENTS_FACILITY_ID_QUERY = '1234';

  beforeEach(() => {
    jest.resetAllMocks();

    jest.mocked(handleRedirectSessionData).mockReturnValue({
      selectedFeeRecordIds: new Set(),
    });
  });

  describe('premium payments filters', () => {
    it('uses provided premiumPaymentsFacilityId', () => {
      // Arrange
      const queryParams = {
        premiumPaymentsFacilityId: PREMIUM_PAYMENTS_FACILITY_ID_QUERY,
      };
      const sessionData = {};

      // Act
      const result = extractQueryAndSessionData(queryParams, sessionData, ORIGINAL_URL);

      // Assert
      expect(result.premiumPaymentsFilters.facilityId).toEqual(PREMIUM_PAYMENTS_FACILITY_ID_QUERY);
    });

    it('validates premiumPaymentsFacilityId and returns any errors as premiumPaymentsFilterError', () => {
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

  it('uses selectedFeeRecordIds from query for isCheckboxChecked when present', () => {
    // Arrange
    const queryParams = {
      premiumPaymentsFacilityId: PREMIUM_PAYMENTS_FACILITY_ID_QUERY,
      selectedFeeRecordIdsQuery: '1,2,3',
    };
    const sessionData = {};

    // Act
    const result = extractQueryAndSessionData(queryParams, sessionData, ORIGINAL_URL);

    // Assert
    expect(result.isCheckboxChecked([1])).toEqual(true);
    expect(result.isCheckboxChecked([2, 3])).toEqual(true);
    expect(result.isCheckboxChecked([4])).toEqual(false);
  });

  it('uses selectedFeeRecordIds from session data for isCheckboxChecked when present', () => {
    // Arrange
    const queryParams = {
      premiumPaymentsFacilityId: PREMIUM_PAYMENTS_FACILITY_ID_QUERY,
    };
    const sessionData = {};

    jest.mocked(handleRedirectSessionData).mockReturnValue({
      selectedFeeRecordIds: new Set([1, 2, 3]),
    });

    // Act
    const result = extractQueryAndSessionData(queryParams, sessionData, ORIGINAL_URL);

    // Assert
    expect(handleRedirectSessionData).toHaveBeenCalledWith({});
    expect(result.isCheckboxChecked([1])).toEqual(true);
    expect(result.isCheckboxChecked([2, 3])).toEqual(true);
    expect(result.isCheckboxChecked([4])).toEqual(false);
  });
});
