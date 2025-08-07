import { add, sub, getUnixTime } from 'date-fns';
import { mapFacilityFieldsToAmendmentFields } from './map-facility-fields-to-amendment-fields';
import { aPortalFacilityAmendment } from '../test-helpers/mock-data-backend/portal-facility-amendment';
import { PORTAL_AMENDMENT_STATUS } from '../constants';

describe('map-facility-fields-to-amendment-fields helper', () => {
  const today = new Date();
  const tomorrow = add(today, { days: 1 });
  const yesterday = sub(today, { days: 1 });
  const anAcknowledgedPortalAmendment = aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED });

  const futureValueAmendment = {
    ...aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED }),
    value: 9999,
    coverEndDate: null,
    effectiveDate: getUnixTime(tomorrow),
  };

  const anotherFutureAmendment = {
    ...aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED }),
    value: 8888,
    coverEndDate: 123456789,
    effectiveDate: getUnixTime(tomorrow),
  };

  const valueAmendment1 = {
    ...anAcknowledgedPortalAmendment,
    value: 5000,
    coverEndDate: null,
    effectiveDate: getUnixTime(yesterday),
  };

  const valueAmendment2 = {
    ...anAcknowledgedPortalAmendment,
    value: 10000,
    coverEndDate: null,
    effectiveDate: getUnixTime(yesterday),
  };

  const coverEndDateAmendment1 = {
    ...anAcknowledgedPortalAmendment,
    coverEndDate: new Date('2023-01-01').valueOf(),
    value: null,
    effectiveDate: getUnixTime(yesterday),
  };

  const coverEndDateAmendment2 = {
    ...anAcknowledgedPortalAmendment,
    coverEndDate: new Date('2023-02-01').valueOf(),
    value: null,
    effectiveDate: getUnixTime(yesterday),
  };

  describe('when there is an amendment with a future effective date', () => {
    it('should ignore amendments with a future effective date', () => {
      const result = mapFacilityFieldsToAmendmentFields([futureValueAmendment]);
      expect(result.value).toBeUndefined();
      expect(result.coverEndDate).toBeUndefined();
    });

    it('should only use amendments with effective dates in the past or today', () => {
      const result = mapFacilityFieldsToAmendmentFields([futureValueAmendment, valueAmendment1]);
      expect(result.value).toEqual(valueAmendment1.value);
      expect(result.coverEndDate).toBeUndefined();
    });

    it('should ignore future amendments even if there are multiple', () => {
      const result = mapFacilityFieldsToAmendmentFields([futureValueAmendment, anotherFutureAmendment]);
      expect(result.value).toBeUndefined();
      expect(result.coverEndDate).toBeUndefined();
    });
  });

  describe('when there is one value amendment', () => {
    it('should return the value from the amendment', () => {
      const result = mapFacilityFieldsToAmendmentFields([valueAmendment1]);

      expect(result.value).toEqual(valueAmendment1.value);
      expect(result.coverEndDate).toBeUndefined();
    });
  });

  describe('when there is one coverEndDate amendment', () => {
    it('should return the coverEndDate from the amendment', () => {
      const result = mapFacilityFieldsToAmendmentFields([coverEndDateAmendment1]);

      expect(result.value).toBeUndefined();
      expect(result.coverEndDate).toEqual(coverEndDateAmendment1.coverEndDate);
    });
  });

  describe('when there are multiple value amendments', () => {
    it('should return the value from the latest amendment', () => {
      const result = mapFacilityFieldsToAmendmentFields([valueAmendment1, valueAmendment2]);

      expect(result.value).toEqual(valueAmendment1.value);
      expect(result.coverEndDate).toBeUndefined();
    });
  });

  describe('when there are multiple coverEndDate amendments', () => {
    it('should return the coverEndDate from the latest amendment', () => {
      const result = mapFacilityFieldsToAmendmentFields([coverEndDateAmendment1, coverEndDateAmendment2]);

      expect(result.value).toBeUndefined();
      expect(result.coverEndDate).toEqual(coverEndDateAmendment1.coverEndDate);
    });
  });
});
