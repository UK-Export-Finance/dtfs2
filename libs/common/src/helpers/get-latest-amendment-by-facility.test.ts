import { ObjectId } from 'mongodb';
import { getUnixTime } from 'date-fns';
import { getLatestAmendmentsByFacility } from './get-latest-amendment-by-facility';
import { aPortalFacilityAmendment } from '../test-helpers/mock-data-backend';

const facilityId1 = new ObjectId();
const facilityId2 = new ObjectId();
const facilityId3 = new ObjectId();

const amendment = aPortalFacilityAmendment({});

const amendment1 = { ...amendment, facilityId: facilityId1, updatedAt: getUnixTime(new Date('2023-01-01')) };
const amendment2 = { ...amendment, facilityId: facilityId2, updatedAt: getUnixTime(new Date('2023-02-01')) };
const amendment3 = { ...amendment, facilityId: facilityId1, updatedAt: getUnixTime(new Date('2023-03-01')) };
const amendment4 = { ...amendment, facilityId: facilityId3, updatedAt: getUnixTime(new Date('2023-01-15')) };
const amendment5 = { ...amendment, facilityId: facilityId2, updatedAt: getUnixTime(new Date('2023-01-15')) };

describe('getLatestAmendmentsByFacility', () => {
  describe('when there are no amendments', () => {
    it('should return an empty object', () => {
      const result = getLatestAmendmentsByFacility([]);
      expect(result).toEqual({});
    });
  });

  describe('when there is only one amendment', () => {
    it('should return that amendment in the correct object format', () => {
      const result = getLatestAmendmentsByFacility([amendment1]);

      const expected = {
        [facilityId1.toString()]: amendment1,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when there are multiple amendments for the same facility', () => {
    it('should return the latest amendment for that facility', () => {
      const result = getLatestAmendmentsByFacility([amendment1, amendment3]);

      const expected = {
        [facilityId1.toString()]: amendment3,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when there are amendments for multiple facilities', () => {
    it('should return the latest amendment for each facility', () => {
      const result = getLatestAmendmentsByFacility([amendment1, amendment2, amendment3, amendment4, amendment5]);

      const expected = {
        [facilityId1.toString()]: amendment3,
        [facilityId2.toString()]: amendment2,
        [facilityId3.toString()]: amendment4,
      };

      expect(result).toEqual(expected);
    });
  });
});
