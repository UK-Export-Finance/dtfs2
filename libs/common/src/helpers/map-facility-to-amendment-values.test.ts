import { mapAmendmentToFacilityValues } from './map-facility-to-amendment-values';
import { aPortalFacilityAmendment } from '../test-helpers/mock-data-backend/portal-facility-amendment';
import { PORTAL_AMENDMENT_STATUS } from '../constants';

describe('map-amendment-to-facility-values helper', () => {
  const anAcknowledgedPortalAmendment = aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED });
  const valueAmendment1 = {
    ...anAcknowledgedPortalAmendment,
    value: 5000,
    coverEndDate: null,
  };

  const valueAmendment2 = {
    ...anAcknowledgedPortalAmendment,
    value: 10000,
    coverEndDate: null,
  };

  const coverEndDateAmendment1 = {
    ...anAcknowledgedPortalAmendment,
    coverEndDate: new Date('2023-01-01').valueOf(),
    value: null,
  };

  const coverEndDateAmendment2 = {
    ...anAcknowledgedPortalAmendment,
    coverEndDate: new Date('2023-02-01').valueOf(),
    value: null,
  };

  describe('when there is one value amendment', () => {
    it('should return the value from the amendment', () => {
      const result = mapAmendmentToFacilityValues([valueAmendment1]);

      expect(result.value).toEqual(valueAmendment1.value);
      expect(result.coverEndDate).toBeNull();
    });
  });

  describe('when there is one coverEndDate amendment', () => {
    it('should return the coverEndDate from the amendment', () => {
      const result = mapAmendmentToFacilityValues([coverEndDateAmendment1]);

      expect(result.value).toBeNull();
      expect(result.coverEndDate).toEqual(coverEndDateAmendment1.coverEndDate);
    });
  });

  describe('when there are multiple value amendments', () => {
    it('should return the value from the latest amendment', () => {
      const result = mapAmendmentToFacilityValues([valueAmendment1, valueAmendment2]);

      expect(result.value).toEqual(valueAmendment1.value);
      expect(result.coverEndDate).toBeNull();
    });
  });

  describe('when there are multiple coverEndDate amendments', () => {
    it('should return the coverEndDate from the latest amendment', () => {
      const result = mapAmendmentToFacilityValues([coverEndDateAmendment1, coverEndDateAmendment2]);

      expect(result.value).toBeNull();
      expect(result.coverEndDate).toEqual(coverEndDateAmendment1.coverEndDate);
    });
  });
});
