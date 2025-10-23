import { ObjectId } from 'mongodb';
import { MONGO_DB_COLLECTIONS, TFM_AMENDMENT_STATUS, CURRENCY, AMENDMENT_TYPES } from '@ukef/dtfs2-common';
import { TfmFacilitiesRepo } from './tfm-facilities.repo';
import { mongoDbClient } from '../../drivers/db-client';
import { aCompletedTfmFacilityAmendment } from '../../../test-helpers';

const facilityId = new ObjectId();

const getCollectionMock = jest.fn();
const findMock = jest.fn();
const findToArrayMock = jest.fn();

let aggregateMock = jest.fn();

// const aTfmAmendment = { ...aTfmFacilityAmendment(), currency: CURRENCY.GBP };
const aCompletedTfmAmendment = {
  ...aCompletedTfmFacilityAmendment(),
  facilityType: 'Cash',
  ukefFacilityId: '12345678',
  currency: CURRENCY.GBP,
  referenceNumber: '12345678-002',
  version: 1,
};

describe('TfmFacilitiesRepo', () => {
  describe('findLatestCompletedAmendmentByFacilityId', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      findToArrayMock.mockResolvedValue([]);
      findMock.mockReturnValue({ toArray: findToArrayMock });

      aggregateMock = jest.fn(() => ({
        map: () => ({
          toArray: findToArrayMock,
        }),
      }));

      jest.spyOn(mongoDbClient, 'getCollection').mockImplementation(getCollectionMock);
      getCollectionMock.mockResolvedValue({
        find: findMock,
        aggregate: aggregateMock,
      });
    });

    it(`should call getCollection with ${MONGO_DB_COLLECTIONS.TFM_FACILITIES}`, async () => {
      // Act
      await TfmFacilitiesRepo.findLatestCompletedAmendmentByFacilityId(facilityId);

      // Assert
      expect(getCollectionMock).toHaveBeenCalledTimes(1);
      expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.TFM_FACILITIES);
    });

    it('should call find with the expected parameters', async () => {
      // Act
      await TfmFacilitiesRepo.findLatestCompletedAmendmentByFacilityId(facilityId);

      // Assert
      const expectedFilter = [
        { $match: { _id: { $eq: new ObjectId(facilityId) } } },
        { $unwind: '$amendments' },
        { $match: { 'amendments.status': { $eq: TFM_AMENDMENT_STATUS.COMPLETED }, 'amendments.type': { $ne: AMENDMENT_TYPES.PORTAL } } },
        { $sort: { 'amendments.referenceNumber': -1, 'amendments.version': -1 } },
        { $project: { _id: false, amendments: true } },
        { $limit: 1 },
      ];

      expect(aggregateMock).toHaveBeenCalledTimes(1);
      expect(aggregateMock).toHaveBeenCalledWith(expectedFilter);
    });

    describe('when there is a completed amendment', () => {
      it('should return the amendment', async () => {
        aggregateMock.mockImplementationOnce(() => ({
          map: () => ({
            toArray: () => Promise.resolve([aCompletedTfmAmendment]),
          }),
        }));

        const result = await TfmFacilitiesRepo.findLatestCompletedAmendmentByFacilityId(facilityId);

        expect(result).toEqual(aCompletedTfmAmendment);
      });
    });
  });
});
