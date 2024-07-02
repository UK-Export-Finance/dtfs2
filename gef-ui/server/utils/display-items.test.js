import { facilityItems } from './display-items';
import { MOCK_ISSUED_FACILITY, MOCK_UNISSUED_FACILITY } from './mocks/mock_facilities';

describe('facilityItems', () => {
  describe('given a facility has an end date', (testFacility) => {
    test.each([MOCK_UNISSUED_FACILITY, MOCK_ISSUED_FACILITY])('should have a visible facility end date and the bank review date should be hidden', () => {
      expect(facilityItems('testUrl', { ...testFacility, facilityEndDateExists: 'true' }).find((item) => item.id === 'facilityEndDate').isHidden).toEqual(false);
      expect(facilityItems('testUrl', { ...testFacility, facilityEndDateExists: 'true' }).find((item) => item.id === 'bankReviewDate').isHidden).toEqual(true);
    });
  });

  describe('given a facility does not have an end date', (testFacility) => {
    test.each([MOCK_UNISSUED_FACILITY, MOCK_ISSUED_FACILITY])('should have a hidden facility end date and a visible bank review date', () => {
      expect(facilityItems('testUrl', { ...testFacility, facilityEndDateExists: 'false' }).find((item) => item.id === 'facilityEndDate').isHidden).toEqual(true);
      expect(facilityItems('testUrl', { ...testFacility, facilityEndDateExists: 'false' }).find((item) => item.id === 'bankReviewDate').isHidden).toEqual(false);
    });
  });
});
