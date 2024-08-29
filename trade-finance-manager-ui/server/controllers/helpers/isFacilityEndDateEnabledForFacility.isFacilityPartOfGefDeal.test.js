import { MAPPED_FACILITY_TYPE } from '@ukef/dtfs2-common';
import { isFacilityPartOfGefDeal } from './isFacilityEndDateEnabledForFacility';

describe('isFacilityEndDateEnabledForTfmFacility helper', () => {
  describe('isFacilityPartOfGefDeal', () => {
    describe.each([MAPPED_FACILITY_TYPE.CASH, MAPPED_FACILITY_TYPE.CONTINGENT])(`when facility type is %s`, (facilityType) => {
      it('should return true', () => {
        const result = isFacilityPartOfGefDeal(facilityType);

        expect(result).toEqual(true);
      });
    });

    describe.each([MAPPED_FACILITY_TYPE.LOAN, 'Bid bond'])(`when facility type is %s`, (facilityType) => {
      it('should return false', () => {
        const result = isFacilityPartOfGefDeal(facilityType);

        expect(result).toEqual(false);
      });
    });
  });
});
