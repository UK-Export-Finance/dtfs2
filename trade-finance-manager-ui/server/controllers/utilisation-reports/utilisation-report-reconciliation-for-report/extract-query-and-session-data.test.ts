import { extractQueryAndSessionData } from './extract-query-and-session-data';
import { handleRedirectSessionData } from './handle-redirect-session-data';
import { validateFacilityIdQuery } from './validate-facility-id-query';

jest.mock('./handle-redirect-session-data');
jest.mock('./validate-facility-id-query');

describe('extractQueryAndSessionData', () => {
  const ORIGINAL_URL = '/original-url';
  const FACILITY_ID_QUERY = '1234';

  beforeEach(() => {
    jest.resetAllMocks();

    jest.mocked(handleRedirectSessionData).mockReturnValue({
      tableDataError: undefined,
      selectedFeeRecordIds: new Set(),
    });
  });

  it('uses provided facilityIdQuery', () => {
    // Arrange
    const queryParams = {
      facilityIdQuery: FACILITY_ID_QUERY,
    };
    const sessionData = {};

    // Act
    const result = extractQueryAndSessionData(queryParams, sessionData, ORIGINAL_URL);

    // Assert
    expect(result.facilityIdQueryString).toBe(FACILITY_ID_QUERY);
  });

  it('validates facilityIdQuery and returns any errors as filterError', () => {
    // Arrange
    const queryParams = {
      facilityIdQuery: FACILITY_ID_QUERY,
    };
    const sessionData = {};

    const mockError = { text: 'Error text', href: '#test-error' };
    jest.mocked(validateFacilityIdQuery).mockReturnValue(mockError);

    // Act
    const result = extractQueryAndSessionData(queryParams, sessionData, ORIGINAL_URL);

    // Assert
    expect(validateFacilityIdQuery).toHaveBeenCalledWith(FACILITY_ID_QUERY, ORIGINAL_URL);
    expect(result.filterError).toEqual(mockError);
  });

  it('uses tableDataError derived from session data', () => {
    // Arrange
    const queryParams = {
      facilityIdQuery: FACILITY_ID_QUERY,
    };
    const sessionData = {};

    const mockTableDataError = { text: 'Test error', href: '#test-error' };
    jest.mocked(handleRedirectSessionData).mockReturnValue({
      tableDataError: mockTableDataError,
      selectedFeeRecordIds: new Set(),
    });

    // Act
    const result = extractQueryAndSessionData(queryParams, sessionData, ORIGINAL_URL);

    // Assert
    expect(handleRedirectSessionData).toHaveBeenCalledWith({});
    expect(result.tableDataError).toEqual(mockTableDataError);
  });

  it('uses selectedFeeRecordIds from query for isCheckboxChecked when present', () => {
    // Arrange
    const queryParams = {
      facilityIdQuery: FACILITY_ID_QUERY,
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

  it('uses selectedFeeRecordIds from session data for isCheckboxChecked when present', () => {
    // Arrange
    const queryParams = {
      facilityIdQuery: FACILITY_ID_QUERY,
    };
    const sessionData = {};

    jest.mocked(handleRedirectSessionData).mockReturnValue({
      tableDataError: undefined,
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
