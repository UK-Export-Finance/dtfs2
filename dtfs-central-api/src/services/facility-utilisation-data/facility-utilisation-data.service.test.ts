import { EntityManager, In } from 'typeorm';
import { FacilityUtilisationDataEntity, FacilityUtilisationDataEntityMockBuilder } from '@ukef/dtfs2-common';
import { when } from 'jest-when';
import { FacilityUtilisationDataService } from './facility-utilisation-data.service';
import { aDbRequestSource, aReportPeriod } from '../../../test-helpers';
import { calculateInitialUtilisationAndFixedFee } from './helpers';
import { getPreviousReportPeriod } from '../../helpers/get-previous-report-period';
import { CHUNK_SIZE_FOR_SQL_BATCH_SAVING } from '../../constants';

jest.mock('./helpers');
jest.mock('../../helpers/get-previous-report-period');

describe('FacilityUtilisationDataService', () => {
  const bankId = '1';

  const mockSave = jest.fn();
  const mockFindBy = jest.fn();
  const mockEntityManager = {
    save: mockSave,
    findBy: mockFindBy,
  } as unknown as EntityManager;

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('initialiseFacilityUtilisationData', () => {
    beforeEach(() => {
      jest.mocked(calculateInitialUtilisationAndFixedFee).mockResolvedValue({ fixedFee: 123.45, utilisation: 678.9 });
      jest.mocked(getPreviousReportPeriod).mockResolvedValue(aReportPeriod());
    });

    describe('when all facility ids are associated with existing FacilityUtilisationDataEntities', () => {
      const facilityIds = new Set(['01', '02', '03']);

      beforeEach(() => {
        mockFindBy.mockResolvedValue([
          FacilityUtilisationDataEntityMockBuilder.forId('01').build(),
          FacilityUtilisationDataEntityMockBuilder.forId('02').build(),
          FacilityUtilisationDataEntityMockBuilder.forId('03').build(),
        ]);
      });

      it('should not create any new FacilityUtilisationDataEntities', async () => {
        // Arrange
        const saveSpy = jest.spyOn(mockEntityManager, 'save');

        // Act
        await FacilityUtilisationDataService.initialiseFacilityUtilisationData(facilityIds, bankId, aReportPeriod(), aDbRequestSource(), mockEntityManager);

        // Assert
        expect(saveSpy).not.toHaveBeenCalled();
      });
    });

    describe('when some facility ids are associated with existing FacilityUtilisationDataEntities', () => {
      const facilityIdWithExistingUtilisationData = '01';
      const facilityIdWithoutExistingUtilisationData = '02';
      const facilityIds = new Set([facilityIdWithExistingUtilisationData, facilityIdWithoutExistingUtilisationData]);

      beforeEach(() => {
        mockFindBy.mockResolvedValue([FacilityUtilisationDataEntityMockBuilder.forId(facilityIdWithExistingUtilisationData).build()]);
      });

      it('should create new FacilityUtilisationDataEntities for the facilities without existing FacilityUtilisationDataEntities', async () => {
        // Arrange
        const utilisation = 111.11;
        const fixedFee = 222.22;
        const requestSource = aDbRequestSource();
        const reportPeriod = { start: { month: 1, year: 2023 }, end: { month: 2, year: 2023 } };
        const previousReportPeriod = { start: { month: 11, year: 2022 }, end: { month: 12, year: 2022 } };

        jest.mocked(calculateInitialUtilisationAndFixedFee).mockResolvedValue({ fixedFee, utilisation });
        jest.mocked(getPreviousReportPeriod).mockResolvedValue(previousReportPeriod);

        // Act
        await FacilityUtilisationDataService.initialiseFacilityUtilisationData(facilityIds, bankId, reportPeriod, requestSource, mockEntityManager);

        // Assert
        expect(mockSave).toHaveBeenCalledTimes(1);
        const expectedEntities = [
          FacilityUtilisationDataEntity.create({
            id: facilityIdWithoutExistingUtilisationData,
            reportPeriod: previousReportPeriod,
            requestSource,
            utilisation,
            fixedFee,
          }),
        ];
        expect(mockSave).toHaveBeenCalledWith(FacilityUtilisationDataEntity, expectedEntities, { chunk: CHUNK_SIZE_FOR_SQL_BATCH_SAVING });
      });
    });

    describe('when all facility ids are not associated with existing FacilityUtilisationDataEntities', () => {
      const firstFacilityId = '01';
      const secondFacilityId = '02';
      const facilityIds = new Set([firstFacilityId, secondFacilityId]);

      beforeEach(() => {
        mockFindBy.mockResolvedValue([]);
      });

      it('should create new FacilityUtilisationDataEntities for all facilities', async () => {
        // Arrange
        const firstUtilisation = 111.11;
        const secondUtilisation = 222.22;
        const firstFixedFee = 333.33;
        const secondFixedFee = 444.44;

        const requestSource = aDbRequestSource();
        const reportPeriod = { start: { month: 1, year: 2023 }, end: { month: 2, year: 2023 } };
        const previousReportPeriod = { start: { month: 11, year: 2022 }, end: { month: 12, year: 2022 } };

        when(calculateInitialUtilisationAndFixedFee).calledWith(firstFacilityId).mockResolvedValue({ fixedFee: firstFixedFee, utilisation: firstUtilisation });
        when(calculateInitialUtilisationAndFixedFee)
          .calledWith(secondFacilityId)
          .mockResolvedValue({ fixedFee: secondFixedFee, utilisation: secondUtilisation });

        jest.mocked(getPreviousReportPeriod).mockResolvedValue(previousReportPeriod);

        // Act
        await FacilityUtilisationDataService.initialiseFacilityUtilisationData(facilityIds, bankId, reportPeriod, requestSource, mockEntityManager);

        // Assert
        expect(mockSave).toHaveBeenCalledTimes(1);
        const expectedEntities = [
          FacilityUtilisationDataEntity.create({
            id: firstFacilityId,
            reportPeriod: previousReportPeriod,
            requestSource,
            utilisation: firstUtilisation,
            fixedFee: firstFixedFee,
          }),
          FacilityUtilisationDataEntity.create({
            id: secondFacilityId,
            reportPeriod: previousReportPeriod,
            requestSource,
            utilisation: secondUtilisation,
            fixedFee: secondFixedFee,
          }),
        ];
        expect(mockSave).toHaveBeenCalledWith(FacilityUtilisationDataEntity, expectedEntities, { chunk: CHUNK_SIZE_FOR_SQL_BATCH_SAVING });
      });
    });
  });

  describe('filterOutFacilityIdsWithExistingUtilisationData', () => {
    describe('when all facility ids are associated with existing FacilityUtilisationDataEntities', () => {
      const facilityIds = new Set(['01', '02', '03']);

      beforeEach(() => {
        mockFindBy.mockResolvedValue([
          FacilityUtilisationDataEntityMockBuilder.forId('01').build(),
          FacilityUtilisationDataEntityMockBuilder.forId('02').build(),
          FacilityUtilisationDataEntityMockBuilder.forId('03').build(),
        ]);
      });

      it('should return an empty set', async () => {
        // Act
        const result = await FacilityUtilisationDataService.filterOutFacilityIdsWithExistingUtilisationData(facilityIds, mockEntityManager);

        // Assert
        expect(result).toEqual(new Set());
        expect(mockFindBy).toHaveBeenCalledTimes(1);
        expect(mockFindBy).toHaveBeenCalledWith(FacilityUtilisationDataEntity, { id: In(Array.from(facilityIds)) });
      });
    });

    describe('when some facility ids are associated with existing FacilityUtilisationDataEntities', () => {
      const facilityIdWithExistingUtilisationData = '01';
      const facilityIdWithoutExistingUtilisationData = '02';
      const facilityIds = new Set([facilityIdWithExistingUtilisationData, facilityIdWithoutExistingUtilisationData]);

      beforeEach(() => {
        mockFindBy.mockResolvedValue([FacilityUtilisationDataEntityMockBuilder.forId(facilityIdWithExistingUtilisationData).build()]);
      });

      it('should return the facility ids not associated with existing FacilityUtilisationDataEntities', async () => {
        // Act
        const result = await FacilityUtilisationDataService.filterOutFacilityIdsWithExistingUtilisationData(facilityIds, mockEntityManager);

        // Assert
        expect(result).toEqual(new Set([facilityIdWithoutExistingUtilisationData]));
        expect(mockFindBy).toHaveBeenCalledTimes(1);
        expect(mockFindBy).toHaveBeenCalledWith(FacilityUtilisationDataEntity, { id: In(Array.from(facilityIds)) });
      });
    });

    describe('when all facility ids are not associated with existing FacilityUtilisationDataEntities', () => {
      const firstFacilityId = '01';
      const secondFacilityId = '02';
      const facilityIds = new Set([firstFacilityId, secondFacilityId]);

      beforeEach(() => {
        mockFindBy.mockResolvedValue([]);
      });

      it('should return all facility ids', async () => {
        // Act
        const result = await FacilityUtilisationDataService.filterOutFacilityIdsWithExistingUtilisationData(facilityIds, mockEntityManager);

        // Assert
        expect(result).toEqual(facilityIds);
        expect(mockFindBy).toHaveBeenCalledTimes(1);
        expect(mockFindBy).toHaveBeenCalledWith(FacilityUtilisationDataEntity, { id: In(Array.from(facilityIds)) });
      });
    });
  });
});
