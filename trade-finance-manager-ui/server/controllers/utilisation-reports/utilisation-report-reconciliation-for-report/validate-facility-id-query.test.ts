import { createRequest } from 'node-mocks-http';
import { validateFacilityIdQuery } from './validate-facility-id-query';

describe('controllers/utilisation-reports/utilisation-report-reconciliation-for-report/validate-facility-id-query', () => {
  describe('validate-facility-id-query', () => {
    const getMockRequest = ({ facilityIdQuery, originalUrl }: { facilityIdQuery: string | undefined; originalUrl: string }) =>
      createRequest({
        query: { facilityIdQuery },
        originalUrl,
      });

    it('returns no error when no query params in original URL', () => {
      // Arrange
      const facilityIdQuery = undefined;
      const req = getMockRequest({ facilityIdQuery, originalUrl: '' });

      // Act
      const { validatedFacilityIdQuery, facilityIdQueryError } = validateFacilityIdQuery(req);

      // Assert
      expect(validatedFacilityIdQuery).toEqual(facilityIdQuery);
      expect(facilityIdQueryError).toEqual(undefined);
    });

    it('returns no error when no facilityIdQuery but originalUrl has query param', () => {
      // Arrange
      const facilityIdQuery = undefined;
      const req = getMockRequest({ facilityIdQuery, originalUrl: '?someOtherQueryParam' });

      // Act
      const { validatedFacilityIdQuery, facilityIdQueryError } = validateFacilityIdQuery(req);

      // Assert
      expect(validatedFacilityIdQuery).toEqual(facilityIdQuery);
      expect(facilityIdQueryError).toEqual(undefined);
    });

    it.each(['abcd', '123', 'c3c3c', '?????', '12345678901'])(
      'returns error when facilityIdQuery %p is invalid and originalUrl has query param',
      (facilityIdQuery) => {
        // Arrange
        const req = getMockRequest({ facilityIdQuery, originalUrl: '?facilityIdQuery' });

        // Act
        const { validatedFacilityIdQuery, facilityIdQueryError } = validateFacilityIdQuery(req);

        // Assert
        expect(validatedFacilityIdQuery).toEqual(facilityIdQuery);
        expect(facilityIdQueryError).toEqual({
          text: 'Enter 4-10 characters of a facility ID',
          href: '#facility-id-filter',
        });
      },
    );

    it('returns no error with valid facilityIdQuery and originalUrl has query param', () => {
      // Arrange
      const facilityIdQuery = '1234';
      const req = getMockRequest({ facilityIdQuery, originalUrl: '?someOtherQueryParam=1234&facilityIdQuery=1234' });

      // Act
      const { validatedFacilityIdQuery, facilityIdQueryError } = validateFacilityIdQuery(req);

      // Assert
      expect(validatedFacilityIdQuery).toEqual(facilityIdQuery);
      expect(facilityIdQueryError).toEqual(undefined);
    });
  });
});
