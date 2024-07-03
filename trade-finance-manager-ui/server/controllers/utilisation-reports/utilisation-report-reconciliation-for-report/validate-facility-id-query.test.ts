import { validateFacilityIdQuery } from './validate-facility-id-query';

describe('controllers/utilisation-reports/utilisation-report-reconciliation-for-report/validate-facility-id-query', () => {
  describe('validate-facility-id-query', () => {
    it('returns no error when no query params in original URL', () => {
      // Arrange
      const facilityIdQuery = undefined;

      // Act
      const facilityIdQueryError = validateFacilityIdQuery(facilityIdQuery, '');

      // Assert
      expect(facilityIdQueryError).toEqual(undefined);
    });

    it('returns no error when no facilityIdQuery but originalUrl has query param', () => {
      // Arrange
      const facilityIdQuery = undefined;

      // Act
      const facilityIdQueryError = validateFacilityIdQuery(facilityIdQuery, '?someOtherQueryParam');

      // Assert
      expect(facilityIdQueryError).toEqual(undefined);
    });

    it.each(['abcd', '123', 'c3c3c', '?????', '12345678901'])(
      'returns error when facilityIdQuery %p is invalid and originalUrl has query param',
      (facilityIdQuery) => {
        // Act
        const facilityIdQueryError = validateFacilityIdQuery(facilityIdQuery, '?facilityIdQuery');

        // Assert
        expect(facilityIdQueryError).toEqual({
          text: 'Enter 4-10 characters of a facility ID',
          href: '#facility-id-filter',
        });
      },
    );

    it('returns no error with valid facilityIdQuery and originalUrl has query param', () => {
      // Arrange
      const facilityIdQuery = '1234';

      // Act
      const facilityIdQueryError = validateFacilityIdQuery(facilityIdQuery, '?someOtherQueryParam=1234&facilityIdQuery=1234');

      // Assert
      expect(facilityIdQueryError).toEqual(undefined);
    });
  });
});
