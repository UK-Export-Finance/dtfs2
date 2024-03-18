import { asString, Bank, ReportPeriod, UtilisationReportEntityMockBuilder, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { createUtilisationReportForBanksJob } from '.';
import { getAllBanks } from '../../repositories/banks-repo';
import { UtilisationReportRepo } from '../../repositories/utilisation-reports-repo';
import { getCurrentReportPeriodForBankSchedule } from '../../utils/report-period';

console.info = jest.fn();

jest.mock('../../repositories/banks-repo');
jest.mock('../../repositories/utilisation-reports-repo');
jest.mock('../../utils/report-period');

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
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
    const saveUtilisationReportSpy = jest.spyOn(UtilisationReportRepo, 'save');
    const findOneByBankIdAndReportPeriodSpy = jest.spyOn(UtilisationReportRepo, 'findOneByBankIdAndReportPeriod');

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

      // Act
      await createUtilisationReportForBanksJob.task(new Date());

      // Assert
      expect(saveUtilisationReportSpy).not.toHaveBeenCalled();
    });

    it('does not try to create any utilisation reports when reports for all banks in the current period already exist', async () => {
      // Arrange
      const bank = { id: '123', name: 'Test bank', isVisibleInTfmUtilisationReports: true } as Bank;
      jest.mocked(getAllBanks).mockResolvedValue([bank]);

      const existingReport = UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED').withBankId(bank.id).build();
      findOneByBankIdAndReportPeriodSpy.mockResolvedValue(existingReport);

      // Act
      await createUtilisationReportForBanksJob.task(new Date());

      // Assert
      expect(findOneByBankIdAndReportPeriodSpy).toHaveBeenCalledWith(bank.id, mockReportPeriod);
      expect(saveUtilisationReportSpy).not.toHaveBeenCalled();
    });

    it('does not try to create reports when the bank is not visible in TFM utilisation reports', async () => {
      // Arrange
      const bank = { id: '1', name: 'Bank 1', isVisibleInTfmUtilisationReports: false } as Bank;
      jest.mocked(getAllBanks).mockResolvedValue([bank]);

      // Act
      await createUtilisationReportForBanksJob.task(new Date());

      // Assert
      expect(findOneByBankIdAndReportPeriodSpy).not.toHaveBeenCalled();
      expect(saveUtilisationReportSpy).not.toHaveBeenCalled();
    });

    const banks = [
      { id: '1', name: 'Bank 1', isVisibleInTfmUtilisationReports: true },
      { id: '2', name: 'Bank 2', isVisibleInTfmUtilisationReports: true },
      { id: '3', name: 'Bank 3', isVisibleInTfmUtilisationReports: true },
    ] as Bank[];

    it('tries to create utilisation reports for all banks when reports for all banks in the current period do not exist', async () => {
      // Arrange
      jest.mocked(getAllBanks).mockResolvedValue(banks);

      findOneByBankIdAndReportPeriodSpy.mockResolvedValue(null);

      // Act
      await createUtilisationReportForBanksJob.task(new Date());

      // Assert
      expect(findOneByBankIdAndReportPeriodSpy).toHaveBeenCalledTimes(banks.length);
      banks.forEach(({ id }) => expect(findOneByBankIdAndReportPeriodSpy).toHaveBeenCalledWith(id, mockReportPeriod));
      expect(saveUtilisationReportSpy).toHaveBeenCalledTimes(banks.length);

      banks.forEach((bank) => {
        const newReport = UtilisationReportEntity.createNotReceived({
          bankId: bank.id,
          reportPeriod: mockReportPeriod,
          requestSource: {
            platform: 'SYSTEM',
          },
        });
        expect(saveUtilisationReportSpy).toHaveBeenCalledWith(newReport);
      });
    });

    it('only tries to create reports for banks which do not have a report for the current report period', async () => {
      // Arrange
      jest.mocked(getAllBanks).mockResolvedValue(banks);

      const bankWithoutReport = banks[0];

      const existingReport = UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED').build();
      findOneByBankIdAndReportPeriodSpy.mockImplementation((bankId: string) => {
        switch (bankId) {
          case bankWithoutReport.id:
            return Promise.resolve(null);
          default:
            return Promise.resolve(existingReport);
        }
      });

      // Act
      await createUtilisationReportForBanksJob.task(new Date());

      // Assert
      expect(findOneByBankIdAndReportPeriodSpy).toHaveBeenCalledTimes(banks.length);
      banks.forEach(({ id }) => expect(findOneByBankIdAndReportPeriodSpy).toHaveBeenCalledWith(id, mockReportPeriod));
      expect(saveUtilisationReportSpy).toHaveBeenCalledTimes(1);

      const newReportForBankWithoutReport = UtilisationReportEntity.createNotReceived({
        bankId: bankWithoutReport.id,
        reportPeriod: mockReportPeriod,
        requestSource: {
          platform: 'SYSTEM',
        },
      });
      expect(saveUtilisationReportSpy).toHaveBeenCalledWith(newReportForBankWithoutReport);
    });
  });
});
