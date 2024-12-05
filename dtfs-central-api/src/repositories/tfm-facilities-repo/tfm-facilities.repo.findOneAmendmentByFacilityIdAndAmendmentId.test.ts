import { ObjectId } from 'mongodb';
import { FacilityAmendment, FacilityNotFoundError, MONGO_DB_COLLECTIONS, TfmFacility } from '@ukef/dtfs2-common';
import { TfmFacilitiesRepo } from './tfm-facilities.repo';
import { mongoDbClient } from '../../drivers/db-client';
import { aTfmFacility } from '../../../test-helpers';

const facilityId = new ObjectId();
const amendmentId = new ObjectId();

const mockGetCollection = jest.fn();
const mockFindOne = jest.fn() as jest.Mock<Promise<TfmFacility | null>>;

describe('TfmFacilitiesRepo', () => {
  describe('findOneAmendmentByFacilityIdAndAmendmentId', () => {
    beforeEach(() => {
      jest.resetAllMocks();

      jest.spyOn(mongoDbClient, 'getCollection').mockImplementation(mockGetCollection);
      mockGetCollection.mockResolvedValue({
        findOne: mockFindOne,
      });
    });

    it(`should call getCollection with ${MONGO_DB_COLLECTIONS.TFM_FACILITIES}`, async () => {
      // Arrange
      mockFindOne.mockResolvedValue(aTfmFacility());

      // Act
      await TfmFacilitiesRepo.findOneAmendmentByFacilityIdAndAmendmentId(facilityId, amendmentId);

      // Assert
      expect(mockGetCollection).toHaveBeenCalledTimes(1);
      expect(mockGetCollection).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.TFM_FACILITIES);
    });

    it('should throw FacilityNotFoundError if the facility does not exist', async () => {
      // Act + Assert
      await expect(() => TfmFacilitiesRepo.findOneAmendmentByFacilityIdAndAmendmentId(facilityId, amendmentId)).rejects.toThrow(FacilityNotFoundError);
    });

    it('should return the correct amendment with the ukefFacilityId', async () => {
      // Arrange
      const amendment = {
        amendmentId,
        facilityId,
      } as FacilityAmendment;

      const facility = aTfmFacility({
        amendments: [
          {
            amendmentId: new ObjectId(),
            facilityId,
          } as FacilityAmendment,
          amendment,
          {
            amendmentId: new ObjectId(),
            facilityId,
          } as FacilityAmendment,
        ],
      });

      mockFindOne.mockResolvedValue(facility);

      // Act
      const result = await TfmFacilitiesRepo.findOneAmendmentByFacilityIdAndAmendmentId(facilityId, amendmentId);

      // Assert
      expect(result).toEqual({
        ...amendment,
        ukefFacilityId: facility.facilitySnapshot.ukefFacilityId,
      });
    });
    describe('when when the amendmentId is given as a string', () => {
      it('should return the correct amendment with the ukefFacilityId ', async () => {
        // Arrange
        const amendment = {
          amendmentId,
          facilityId,
        } as FacilityAmendment;

        const facility = aTfmFacility({
          amendments: [
            {
              amendmentId: new ObjectId(),
              facilityId,
            } as FacilityAmendment,
            amendment,
            {
              amendmentId: new ObjectId(),
              facilityId,
            } as FacilityAmendment,
          ],
        });

        mockFindOne.mockResolvedValue(facility);

        // Act
        const result = await TfmFacilitiesRepo.findOneAmendmentByFacilityIdAndAmendmentId(facilityId, amendmentId.toString());

        // Assert
        expect(result).toEqual({
          ...amendment,
          ukefFacilityId: facility.facilitySnapshot.ukefFacilityId,
        });
      });
    });

    describe('when the amendment is not found', () => {
      it('should return undefined', async () => {
        // Arrange
        const facility = aTfmFacility({
          amendments: [
            {
              amendmentId: new ObjectId(),
              facilityId,
            } as FacilityAmendment,
            {
              amendmentId: new ObjectId(),
              facilityId,
            } as FacilityAmendment,
          ],
        });

        mockFindOne.mockResolvedValue(facility);

        // Act
        const result = await TfmFacilitiesRepo.findOneAmendmentByFacilityIdAndAmendmentId(facilityId, amendmentId);

        // Assert
        expect(result).toEqual(undefined);
      });
    });
  });
});
