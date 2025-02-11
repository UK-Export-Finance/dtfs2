import { HttpStatusCode } from 'axios';
import { Response } from 'supertest';

/**
 * Generate tests for `Not found` and `Problem with the service` pages when making a GET request
 * to an amendment page
 * @param withGetAmendmentPageErrorHandlingTestsParams
 * @param withGetAmendmentPageErrorHandlingTestsParams.makeRequest - function to make the GET request
 * @param withGetAmendmentPageErrorHandlingTestsParams.mockGetAmendment - mock GET amendment request
 * @param withGetAmendmentPageErrorHandlingTestsParams.mockGetFacility - mock GET facility request
 * @param withGetAmendmentPageErrorHandlingTestsParams.mockGetApplication - mock GET deal request
 */
export const withGetAmendmentPageErrorHandlingTests = ({
  makeRequest,
  mockGetAmendment,
  mockGetFacility,
  mockGetApplication,
}: {
  makeRequest: () => Promise<Response>;
  mockGetAmendment: jest.Mock;
  mockGetFacility: jest.Mock;
  mockGetApplication: jest.Mock;
}) => {
  const notFoundTestCases: { description: string; arrange: () => void }[] = [
    {
      description: 'facility not found',
      arrange: () => mockGetFacility.mockResolvedValue({ details: undefined }),
    },
    {
      description: 'deal not found',
      arrange: () => mockGetApplication.mockResolvedValue(undefined),
    },
    {
      description: 'amendment not found',
      arrange: () => mockGetAmendment.mockResolvedValue(undefined),
    },
  ];

  it.each(notFoundTestCases)('should redirect to /not-found when $description', async ({ arrange }) => {
    // Arrange
    arrange();

    // Act
    const response = await makeRequest();

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Found);
    expect(response.headers.location).toEqual('/not-found');
  });

  const problemWithServiceTestCases: { description: string; arrange: () => void }[] = [
    {
      description: 'getFacility throws an error',
      arrange: () => mockGetFacility.mockRejectedValue(new Error('test error')),
    },
    {
      description: 'getApplication throws an error',
      arrange: () => mockGetApplication.mockRejectedValue(new Error('test error')),
    },
    {
      description: 'getAmendment throws an error',
      arrange: () => mockGetAmendment.mockRejectedValue(new Error('test error')),
    },
  ];

  it.each(problemWithServiceTestCases)(`should render 'problem with service' when $description`, async ({ arrange }) => {
    // Arrange
    arrange();

    // Act
    const response = await makeRequest();

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);
    expect(response.text).toContain('Problem with the service');
  });
};
