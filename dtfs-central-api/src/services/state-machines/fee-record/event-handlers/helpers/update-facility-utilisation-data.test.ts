import { EntityManager } from 'typeorm';
import { when } from 'jest-when';
import { DbRequestSource, FacilityUtilisationDataEntity, FacilityUtilisationDataEntityMockBuilder, ReportPeriod } from '@ukef/dtfs2-common';
import { updateFacilityUtilisationData } from './update-facility-utilisation-data';
import { getFixedFeeForFacility } from './get-fixed-fee-for-facility';
import { aDbRequestSource } from '../../../../../../test-helpers/test-data';

jest.mock('./get-fixed-fee-for-facility');

describe('updateFacilityUtilisationData', () => {
  const mockSave = jest.fn();

  const mockEntityManager = {
    save: mockSave,
  } as unknown as EntityManager;

  beforeEach(() => {
    jest.mocked(getFixedFeeForFacility).mockResolvedValue(100);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('updates the facility utilisation data entity with the supplied report period, utilisation and request source and saves the entity', async () => {
    // Arrange
    const facilityUtilisationDataEntity = FacilityUtilisationDataEntityMockBuilder.forId('12345678')
      .withUtilisation(1234567.89)
      .withReportPeriod({
        start: { month: 1, year: 2021 },
        end: { month: 2, year: 2022 },
      })
      .build();

    const reportPeriod: ReportPeriod = {
      start: { month: 6, year: 2026 },
      end: { month: 7, year: 2027 },
    };
    const utilisation = 9876543.21;
    const requestSource: DbRequestSource = {
      platform: 'TFM',
      userId: 'abc123',
    };

    // Act
    await updateFacilityUtilisationData(facilityUtilisationDataEntity, {
      reportPeriod,
      utilisation,
      requestSource,
      entityManager: mockEntityManager,
    });

    // Assert
    expect(mockSave).toHaveBeenCalledWith(FacilityUtilisationDataEntity, facilityUtilisationDataEntity);
    expect(facilityUtilisationDataEntity.utilisation).toBe(9876543.21);
    expect(facilityUtilisationDataEntity.reportPeriod).toEqual(reportPeriod);
    expect(facilityUtilisationDataEntity.lastUpdatedByTfmUserId).toBe('abc123');
    expect(facilityUtilisationDataEntity.lastUpdatedByPortalUserId).toBeNull();
    expect(facilityUtilisationDataEntity.lastUpdatedByIsSystemUser).toBe(false);
  });

  it('calculates the fixed fee using the supplied facility utilisation data id and utilisation and the supplied report period and updates the facility utilisation data fixed fee', async () => {
    // Arrange
    const facilityUtilisationDataEntity = FacilityUtilisationDataEntityMockBuilder.forId('12345678')
      .withUtilisation(123.45)
      .withReportPeriod({
        start: { month: 1, year: 2021 },
        end: { month: 2, year: 2022 },
      })
      .build();

    const reportPeriod: ReportPeriod = {
      start: { month: 6, year: 2026 },
      end: { month: 7, year: 2027 },
    };
    const utilisation = 9876543.21;

    when(getFixedFeeForFacility).calledWith('12345678', utilisation, reportPeriod).mockResolvedValue(76543.21);

    // Act
    await updateFacilityUtilisationData(facilityUtilisationDataEntity, {
      reportPeriod,
      utilisation,
      requestSource: aDbRequestSource(),
      entityManager: mockEntityManager,
    });

    // Assert
    expect(facilityUtilisationDataEntity.fixedFee).toBe(76543.21);
  });
});
