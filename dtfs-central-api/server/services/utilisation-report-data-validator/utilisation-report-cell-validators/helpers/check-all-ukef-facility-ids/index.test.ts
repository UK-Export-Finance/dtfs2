import { UTILISATION_REPORT_HEADERS, UtilisationReportCsvRowData } from '@ukef/dtfs2-common';
import { TfmFacilitiesRepo } from '../../../../../repositories/tfm-facilities-repo';
import { checkAllUkefFacilityIds } from '.';

describe('checkAllUkefFacilityIds', () => {
  const getGefFacilityMatchStatusSpy = jest.spyOn(TfmFacilitiesRepo, 'ukefGefFacilitiesExist');

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('when there are facility IDs in the CSV data', () => {
    const csvData: UtilisationReportCsvRowData[] = [
      { [UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID]: { value: '12345678' } },
      { [UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID]: { value: '87654321' } },
      { [UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID]: { value: null } },
      { [UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID]: { value: '12345678' } },
    ];

    beforeEach(() => {
      getGefFacilityMatchStatusSpy.mockResolvedValue({ '12345678': true, '87654321': false });
    });

    it('should call TfmFacilitiesRepo.ukefGefFacilitiesExist with the correct facility IDs', async () => {
      // Act
      await checkAllUkefFacilityIds(csvData);

      // Assert
      expect(getGefFacilityMatchStatusSpy).toHaveBeenCalledTimes(1);
      expect(getGefFacilityMatchStatusSpy).toHaveBeenCalledWith(['12345678', '87654321']);
    });

    it('should return the CSV data with the correct match status on each facility ID cell', async () => {
      // Act
      const result = await checkAllUkefFacilityIds(csvData);

      // Assert
      const expectedResult = [
        { [UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID]: { value: '12345678', ukefFacilityIdMatches: true } },
        { [UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID]: { value: '87654321', ukefFacilityIdMatches: false } },
        { [UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID]: { value: null } },
        { [UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID]: { value: '12345678', ukefFacilityIdMatches: true } },
      ];

      expect(result).toEqual(expectedResult);
    });
  });

  describe('when there are no facility IDs in the CSV data', () => {
    const csvData: UtilisationReportCsvRowData[] = [{ [UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID]: { value: null } }];

    it('should not call TfmFacilitiesRepo.ukefGefFacilitiesExist when every facility ID is missing', async () => {
      // Act
      await checkAllUkefFacilityIds(csvData);

      // Assert
      expect(getGefFacilityMatchStatusSpy).not.toHaveBeenCalled();
    });

    it('should return the original CSV data when every facility ID is missing', async () => {
      // Act
      const result = await checkAllUkefFacilityIds(csvData);

      // Assert
      expect(result).toEqual(csvData);
    });
  });
});
