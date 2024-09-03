import { validateFacilityIdQuery } from './validate-facility-id-query';

describe('controllers/utilisation-reports/utilisation-report-reconciliation-for-report/validate-facility-id-query', () => {
  describe('validate-facility-id-query', () => {
    it('returns no error when no query params in original URL', () => {
      // Arrange
      const facilityIdQuery = undefined;

      // Act
      const filterError = validateFacilityIdQuery(facilityIdQuery, '');

      // Assert
      expect(filterError).toEqual(undefined);
    });

    it('returns no error when no facilityIdQuery but originalUrl has other query param', () => {
      // Arrange
      const facilityIdQuery = undefined;

      // Act
      const filterError = validateFacilityIdQuery(facilityIdQuery, '?someOtherQueryParam');

      // Assert
      expect(filterError).toEqual(undefined);
    });

    it('returns error when facilityIdQuery param provided with empty value', () => {
      // Arrange
      const facilityIdQuery = undefined;

      // Act
      const filterError = validateFacilityIdQuery(facilityIdQuery, '?facilityIdQuery=');

      // Assert
      expect(filterError).toEqual({
        text: 'Enter a facility ID',
        href: '#facility-id-filter',
      });
    });

    it.each(['abcd', 'c3c3c', '?????'])('returns error when facilityIdQuery %p is not a number', (facilityIdQuery) => {
      // Act
      const filterError = validateFacilityIdQuery(facilityIdQuery, '?facilityIdQuery');

      // Assert
      expect(filterError).toEqual({
        text: 'Facility ID must be a number',
        href: '#facility-id-filter',
      });
    });

    it.each(['123', '12345678901'])('returns error when facilityIdQuery %p is not within 4 and 10 characters', (facilityIdQuery) => {
      // Act
      const filterError = validateFacilityIdQuery(facilityIdQuery, '?facilityIdQuery');

      // Assert
      expect(filterError).toEqual({
        text: 'Facility ID must be between 4 and 10 characters',
        href: '#facility-id-filter',
      });
    });

    it('returns no error with valid facilityIdQuery', () => {
      // Arrange
      const facilityIdQuery = '1234';

      // Act
      const filterError = validateFacilityIdQuery(facilityIdQuery, '?someOtherQueryParam=1234&facilityIdQuery=1234');

      // Assert
      expect(filterError).toEqual(undefined);
    });
  });
});
