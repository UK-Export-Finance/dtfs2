import { AmendmentsEligibilityCriteria, FACILITY_TYPE, MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { mongoDbClient } from '../../drivers/db-client';
import { EligibilityCriteriaAmendmentsRepo } from './eligibility-criteria-amendments.repo';
import { anAmendmentsEligibilityCriteria } from '../../../test-helpers/test-data/eligibility-criteria-amendments';

describe('EligibilityCriteriaAmendmentsRepo', () => {
  const findToArrayMock = jest.fn();
  const findMock = jest.fn();
  const getCollectionMock = jest.fn();

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('findLatestEligibilityCriteria', () => {
    const eligibilityCriteria: AmendmentsEligibilityCriteria = anAmendmentsEligibilityCriteria();

    beforeEach(() => {
      findToArrayMock.mockResolvedValue([eligibilityCriteria]);
      findMock.mockReturnValue({ sort: () => ({ limit: () => ({ toArray: findToArrayMock }) }) });

      getCollectionMock.mockResolvedValue({
        find: findMock,
      });

      jest.spyOn(mongoDbClient, 'getCollection').mockImplementation(getCollectionMock);
    });

    it(`calls getCollection with ${MONGO_DB_COLLECTIONS.ELIGIBILITY_CRITERIA_AMENDMENTS}`, async () => {
      // Act
      await EligibilityCriteriaAmendmentsRepo.findLatestEligibilityCriteria(FACILITY_TYPE.CASH);

      // Assert
      expect(getCollectionMock).toHaveBeenCalledTimes(1);
      expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.ELIGIBILITY_CRITERIA_AMENDMENTS);
    });

    it('calls find with the expected parameters', async () => {
      // Act
      const facilityType = FACILITY_TYPE.CASH;
      await EligibilityCriteriaAmendmentsRepo.findLatestEligibilityCriteria(facilityType);

      // Assert
      const expectedFilter = { $and: [{ facilityType }, { isInDraft: { $eq: false } }] };

      expect(findMock).toHaveBeenCalledTimes(1);
      expect(findMock).toHaveBeenCalledWith(expectedFilter);
    });

    it('returns the found latest eligibility criteria', async () => {
      // Act
      const facilityType = FACILITY_TYPE.CASH;
      const result = await EligibilityCriteriaAmendmentsRepo.findLatestEligibilityCriteria(facilityType);

      // Assert
      expect(result).toEqual(eligibilityCriteria);
    });
  });
});
