import { createRequest } from 'node-mocks-http';
import { extractQueryAndSessionData } from './extract-query-and-session-data';
import { getAndClearFieldsFromRedirectSessionData } from './get-and-clear-fields-from-redirect-session-data';
import { validateFacilityIdQuery } from './validate-facility-id-query';

jest.mock('./get-and-clear-fields-from-redirect-session-data');
jest.mock('./validate-facility-id-query');

type QueryData = {
  facilityIdQuery: string;
  selectedFeeRecordIds?: string;
};

describe('extractQueryAndSessionData', () => {
  const ORIGINAL_URL = '/original-url';
  const FACILITY_ID_QUERY = '1234';

  const getMockRequest = ({ facilityIdQuery, selectedFeeRecordIds }: QueryData) =>
    createRequest({
      query: {
        facilityIdQuery,
        selectedFeeRecordIds,
      },
      originalUrl: ORIGINAL_URL,
    });

  beforeEach(() => {
    jest.resetAllMocks();

    jest.mocked(getAndClearFieldsFromRedirectSessionData).mockReturnValue({
      tableDataError: undefined,
      selectedFeeRecordIds: new Set(),
    });
  });

  it('extracts facilityIdQuery from request query', () => {
    // Arrange
    const req = getMockRequest({
      facilityIdQuery: FACILITY_ID_QUERY,
      selectedFeeRecordIds: undefined,
    });

    // Act
    const result = extractQueryAndSessionData(req);

    // Assert
    expect(result.facilityIdQueryString).toBe(FACILITY_ID_QUERY);
  });

  it('validates facilityIdQuery and returns any errors as filterError', () => {
    // Arrange
    const req = getMockRequest({
      facilityIdQuery: FACILITY_ID_QUERY,
      selectedFeeRecordIds: undefined,
    });
    const mockError = { text: 'Error text', href: '#test-error' };
    jest.mocked(validateFacilityIdQuery).mockReturnValue(mockError);

    // Act
    const result = extractQueryAndSessionData(req);

    // Assert
    expect(validateFacilityIdQuery).toHaveBeenCalledWith(FACILITY_ID_QUERY, ORIGINAL_URL);
    expect(result.filterError).toEqual(mockError);
  });

  it('extracts tableDataError from session data', () => {
    // Arrange
    const req = getMockRequest({
      facilityIdQuery: FACILITY_ID_QUERY,
      selectedFeeRecordIds: undefined,
    });

    const mockTableDataError = { text: 'Test error', href: '#test-error' };
    jest.mocked(getAndClearFieldsFromRedirectSessionData).mockReturnValue({
      tableDataError: mockTableDataError,
      selectedFeeRecordIds: new Set(),
    });

    // Act
    const result = extractQueryAndSessionData(req);

    // Assert
    expect(getAndClearFieldsFromRedirectSessionData).toHaveBeenCalledWith(req);
    expect(result.tableDataError).toEqual(mockTableDataError);
  });

  it('extracts selectedFeeRecordIds from query when present', () => {
    // Arrange
    const req = getMockRequest({
      facilityIdQuery: FACILITY_ID_QUERY,
      selectedFeeRecordIds: '1,2,3',
    });

    // Act
    const result = extractQueryAndSessionData(req);

    // Assert
    expect(result.isCheckboxChecked([1])).toBe(true);
    expect(result.isCheckboxChecked([2, 3])).toBe(true);
    expect(result.isCheckboxChecked([4])).toBe(false);
  });

  it('extracts selectedFeeRecordIds from session data when present', () => {
    // Arrange
    const req = getMockRequest({
      facilityIdQuery: FACILITY_ID_QUERY,
      selectedFeeRecordIds: '1,2,3',
    });

    jest.mocked(getAndClearFieldsFromRedirectSessionData).mockReturnValue({
      tableDataError: undefined,
      selectedFeeRecordIds: new Set([1, 2, 3]),
    });

    // Act
    const result = extractQueryAndSessionData(req);

    // Assert
    expect(getAndClearFieldsFromRedirectSessionData).toHaveBeenCalledWith(req);
    expect(result.isCheckboxChecked([1])).toBe(true);
    expect(result.isCheckboxChecked([2, 3])).toBe(true);
    expect(result.isCheckboxChecked([4])).toBe(false);
  });
});
