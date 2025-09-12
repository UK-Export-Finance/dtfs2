import { ObjectId } from 'mongodb';
import { MONGO_DB_COLLECTIONS, TFM_AMENDMENT_STATUS, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { aPortalFacilityAmendment } from '@ukef/dtfs2-common/mock-data-backend';
import { TfmFacilitiesRepo } from './tfm-facilities.repo';
import { mongoDbClient } from '../../drivers/db-client';

const facilityId = new ObjectId();

const getCollectionMock = jest.fn();
const findMock = jest.fn();
const findToArrayMock = jest.fn();

let aggregateMock = jest.fn();

const anAcknowledgedPortalAmendment = aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED });
const secondAcknowledgedPortalAmendment = aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED });

describe('TfmFacilitiesRepo', () => {
  describe('findLatestValueAmendmentByFacilityId', () => {
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
      await TfmFacilitiesRepo.findLatestValueAmendmentByFacilityId(facilityId);

      // Assert
      expect(getCollectionMock).toHaveBeenCalledTimes(1);
      expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.TFM_FACILITIES);
    });

    it('should call find with the expected parameters', async () => {
      // Act
      await TfmFacilitiesRepo.findLatestValueAmendmentByFacilityId(facilityId);

      // Assert
      const expectedFilter = [
        { $match: { _id: { $eq: new ObjectId(facilityId) } } },
        { $unwind: '$amendments' },
        {
          $match: {
            'amendments.status': { $in: [TFM_AMENDMENT_STATUS.COMPLETED, PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED] },
            'amendments.changeFacilityValue': { $eq: true },
          },
        },
        { $sort: { 'amendments.updatedAt': -1, 'amendments.version': -1 } },
        { $project: { _id: false, amendments: true } },
        { $limit: 1 },
      ];

      expect(aggregateMock).toHaveBeenCalledTimes(1);
      expect(aggregateMock).toHaveBeenCalledWith(expectedFilter);
    });
  });

  describe('when there is only one completed value amendment', () => {
    it('should return the amendment', async () => {
      aggregateMock.mockImplementationOnce(() => ({
        map: () => ({
          toArray: () => Promise.resolve([anAcknowledgedPortalAmendment]),
        }),
      }));

      const result = await TfmFacilitiesRepo.findLatestValueAmendmentByFacilityId(facilityId);

      expect(result).toEqual(anAcknowledgedPortalAmendment);
    });
  });

  describe('when there are multiple completed value amendments', () => {
    it('should return the latest amendment', async () => {
      aggregateMock.mockImplementationOnce(() => ({
        map: () => ({
          toArray: () => Promise.resolve([secondAcknowledgedPortalAmendment, anAcknowledgedPortalAmendment]),
        }),
      }));

      const result = await TfmFacilitiesRepo.findLatestValueAmendmentByFacilityId(facilityId);

      expect(result).toEqual(secondAcknowledgedPortalAmendment);
    });
  });

  describe('when there are no completed value amendments', () => {
    it('should return null', async () => {
      aggregateMock.mockImplementationOnce(() => ({
        map: () => ({
          toArray: () => Promise.resolve([]),
        }),
      }));

      const result = await TfmFacilitiesRepo.findLatestValueAmendmentByFacilityId(facilityId);

      expect(result).toBeNull();
    });
  });
});
