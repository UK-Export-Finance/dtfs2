const { facilitiesValidation } = require('./facilities');

describe('GEF controllers validation - facilities', () => {
  const mockFacility = {
    hasBeenIssued: true,
    name: 'Facility one',
    shouldCoverStartOnSubmission: false,
    coverStartDate: '2021-12-03T00:00:00.000Z',
    coverEndDate: '2040-01-01T00:00:00.000Z',
    monthsOfCover: null,
    coverPercentage: 80,
    interestPercentage: 1,
  };

  describe('facilitiesValidation', () => {
    describe('when the deal version < 1', () => {
      it('should not return any facility end date fields as required', () => {
        const result = facilitiesValidation(mockFacility, 0);

        expect(result.required).not.toEqual(expect.arrayContaining(['isUsingFacilityEndDate']));
        expect(result.required).not.toEqual(expect.arrayContaining(['facilityEndDate']));
        expect(result.required).not.toEqual(expect.arrayContaining(['bankReviewDate']));
      });
    });

    describe('when the deal version >= 1', () => {
      it('should return isUsingFacilityEndDate as required if it is currently null', () => {
        const result = facilitiesValidation({ ...mockFacility, isUsingFacilityEndDate: null }, 1);

        expect(result.required).toEqual(expect.arrayContaining(['isUsingFacilityEndDate']));
      });

      it('should return facilityEndDate as required if it is currently null and isUsingFacilityEndDate is true', () => {
        const result = facilitiesValidation({ ...mockFacility, isUsingFacilityEndDate: true }, 1);

        expect(result.required).toEqual(expect.arrayContaining(['facilityEndDate']));
      });

      it('should return bankReviewDate as required if it is currently null and isUsingFacilityEndDate is false', () => {
        const result = facilitiesValidation({ ...mockFacility, isUsingFacilityEndDate: false }, 1);

        expect(result.required).toEqual(expect.arrayContaining(['bankReviewDate']));
      });

      it('should return no facility end date fields as required if a facility end date has been provided', () => {
        const result = facilitiesValidation({ ...mockFacility, isUsingFacilityEndDate: true, facilityEndDate: '2024-02-14T00:00:00.000+00:00' }, 1);

        expect(result.required).not.toEqual(expect.arrayContaining(['isUsingFacilityEndDate']));
        expect(result.required).not.toEqual(expect.arrayContaining(['facilityEndDate']));
        expect(result.required).not.toEqual(expect.arrayContaining(['bankReviewDate']));
      });

      it('should return no facility end date fields as required if a bank review date has been provided', () => {
        const result = facilitiesValidation({ ...mockFacility, isUsingFacilityEndDate: false, bankReviewDate: '2024-02-14T00:00:00.000+00:00' }, 1);

        expect(result.required).not.toEqual(expect.arrayContaining(['isUsingFacilityEndDate']));
        expect(result.required).not.toEqual(expect.arrayContaining(['facilityEndDate']));
        expect(result.required).not.toEqual(expect.arrayContaining(['bankReviewDate']));
      });
    });
  });
});
