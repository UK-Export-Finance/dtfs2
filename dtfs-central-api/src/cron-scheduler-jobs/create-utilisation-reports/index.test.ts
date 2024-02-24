import { asString } from '@ukef/dtfs2-common';
import { createUtilisationReportForBanksJob } from '.';
import { getAllBanks } from '../../services/repositories/banks-repo';
import * as utilisationReportsRepo from '../../services/repositories/utilisation-reports-repo';
import { getCurrentReportPeriodForBankSchedule } from '../../utils/report-period';
import { Bank } from '../../types/db-models/banks';
import { UtilisationReport } from '../../types/db-models/utilisation-reports';
import { ReportPeriod } from '../../types/utilisation-reports';

console.info = jest.fn();

jest.mock('../../services/repositories/banks-repo');
jest.mock('../../services/repositories/utilisation-reports-repo');
jest.mock('../../utils/report-period');
jest.mock('@ukef/dtfs2-common', () => ({
  asString: jest.fn(),
}));

const originalProcessEnv = process.env;

describe('scheduler/jobs/create-utilisation-reports', () => {
  beforeEach(() => {
    jest.mocked(asString).mockImplementation((value) => value as string);
  });

  afterEach(() => {
    process.env = { ...originalProcessEnv };
  });

  describe('the task', () => {
    const mockReportPeriod = {} as ReportPeriod;

    beforeEach(() => {
      jest.mocked(getCurrentReportPeriodForBankSchedule).mockReturnValue(mockReportPeriod);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('does not try to create any utilisation reports when there are no banks', async () => {
      // Arrange
      jest.mocked(getAllBanks).mockResolvedValue([]);
      const updateUtilisationReportDetailsWithUploadDetailsSpy = jest.spyOn(utilisationReportsRepo, 'updateUtilisationReportDetailsWithUploadDetails');

      // Act
      await createUtilisationReportForBanksJob.task(new Date());

      // Assert
      expect(updateUtilisationReportDetailsWithUploadDetailsSpy).not.toHaveBeenCalled();
    });

    it('does not try to create any utilisation reports when reports for all banks in the current period already exist', async () => {
      // Arrange
      const bank = { id: '123', name: 'Test bank', isVisibleInTfmUtilisationReports: true } as Bank;
      jest.mocked(getAllBanks).mockResolvedValue([bank]);
      const getOneUtilisationReportDetailsByBankIdSpy = jest
        .mocked(utilisationReportsRepo.getOneUtilisationReportDetailsByBankId)
        .mockResolvedValue({} as UtilisationReport);
      const saveNotReceivedUtilisationReportSpy = jest.spyOn(utilisationReportsRepo, 'saveNotReceivedUtilisationReport');

      // Act
      await createUtilisationReportForBanksJob.task(new Date());

      // Assert
      expect(getOneUtilisationReportDetailsByBankIdSpy).toHaveBeenCalledWith(bank.id, { reportPeriod: mockReportPeriod });
      expect(saveNotReceivedUtilisationReportSpy).not.toHaveBeenCalled();
    });

    it('does not try to create reports when the bank is not visible in TFM utilisation reports', async () => {
      // Arrange
      const bank = { id: '1', name: 'Bank 1', isVisibleInTfmUtilisationReports: false } as Bank;
      jest.mocked(getAllBanks).mockResolvedValue([bank]);
      const getOneUtilisationReportDetailsByBankIdSpy = jest.mocked(utilisationReportsRepo.getOneUtilisationReportDetailsByBankId).mockResolvedValue(null);
      const saveNotReceivedUtilisationReportSpy = jest.spyOn(utilisationReportsRepo, 'saveNotReceivedUtilisationReport');

      // Act
      await createUtilisationReportForBanksJob.task(new Date());

      // Assert
      expect(getOneUtilisationReportDetailsByBankIdSpy).not.toHaveBeenCalled();
      expect(saveNotReceivedUtilisationReportSpy).not.toHaveBeenCalled();
    });

    const banks = [
      { id: '1', name: 'Bank 1', isVisibleInTfmUtilisationReports: true },
      { id: '2', name: 'Bank 2', isVisibleInTfmUtilisationReports: true },
      { id: '3', name: 'Bank 3', isVisibleInTfmUtilisationReports: true },
    ] as Bank[];

    it('tries to create utilisation reports for all banks when reports for all banks in the current period do not exist', async () => {
      // Arrange
      jest.mocked(getAllBanks).mockResolvedValue(banks);
      const getOneUtilisationReportDetailsByBankIdSpy = jest.mocked(utilisationReportsRepo.getOneUtilisationReportDetailsByBankId).mockResolvedValue(null);
      const saveNotReceivedUtilisationReportSpy = jest.spyOn(utilisationReportsRepo, 'saveNotReceivedUtilisationReport');

      // Act
      await createUtilisationReportForBanksJob.task(new Date());

      // Assert
      expect(getOneUtilisationReportDetailsByBankIdSpy).toHaveBeenCalledTimes(banks.length);
      banks.forEach(({ id }) => expect(getOneUtilisationReportDetailsByBankIdSpy).toHaveBeenCalledWith(id, { reportPeriod: mockReportPeriod }));
      expect(saveNotReceivedUtilisationReportSpy).toHaveBeenCalledTimes(banks.length);
      banks.forEach((bank) => expect(saveNotReceivedUtilisationReportSpy).toHaveBeenCalledWith(mockReportPeriod, { id: bank.id, name: bank.name }));
    });

    it('only tries to create reports for banks which do not have a report for the current report period', async () => {
      // Arrange
      jest.mocked(getAllBanks).mockResolvedValue(banks);

      const bankWithoutReport = banks[0];
      const getOneUtilisationReportDetailsByBankIdSpy = jest
        .mocked(utilisationReportsRepo.getOneUtilisationReportDetailsByBankId)
        .mockImplementation((bankId: string) => {
          switch (bankId) {
            case bankWithoutReport.id:
              return Promise.resolve(null);
            default:
              return Promise.resolve({} as UtilisationReport);
          }
        });
      const saveNotReceivedUtilisationReportSpy = jest.spyOn(utilisationReportsRepo, 'saveNotReceivedUtilisationReport');

      // Act
      await createUtilisationReportForBanksJob.task(new Date());

      // Assert
      expect(getOneUtilisationReportDetailsByBankIdSpy).toHaveBeenCalledTimes(banks.length);
      banks.forEach(({ id }) => expect(getOneUtilisationReportDetailsByBankIdSpy).toHaveBeenCalledWith(id, { reportPeriod: mockReportPeriod }));
      expect(saveNotReceivedUtilisationReportSpy).toHaveBeenCalledTimes(1);
      expect(saveNotReceivedUtilisationReportSpy).toHaveBeenCalledWith(mockReportPeriod, { id: bankWithoutReport.id, name: bankWithoutReport.name });
    });
  });
});
