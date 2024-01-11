import { createUtilisationReportForBanksJob } from '.';
import { getAllBanks } from '../../../services/repositories/banks-repo';
import * as utilisationReportsRepo from '../../../services/repositories/utilisation-reports-repo';
import { getCurrentReportPeriodForBankSchedule } from '../../../utils/report-period';
import { Bank } from '../../../types/db-models/banks';
import { UtilisationReport } from '../../../types/db-models/utilisation-reports';
import { ReportPeriod } from '../../../types/utilisation-reports';

console.info = jest.fn();

jest.mock('../../../services/repositories/banks-repo');
jest.mock('../../../services/repositories/utilisation-reports-repo');
jest.mock('../../../utils/report-period');

describe('scheduler/jobs/create-utilisation-reports', () => {
  const scheduleEnvVariableName = 'CREATE_UTILISATION_REPORT_FOR_BANKS_SCHEDULE';
  const testSchedule = '* * * * *';

  let originalProcessEnv: NodeJS.ProcessEnv;
  beforeAll(() => {
    originalProcessEnv = process.env;
  });

  beforeEach(() => {
    process.env = { ...originalProcessEnv };
    process.env[scheduleEnvVariableName] = testSchedule;
  });

  afterAll(() => {
    process.env = { ...originalProcessEnv };
  });

  it('throws an error when the environment variable is undefined', () => {
    // Arrange
    process.env = {};

    // Act/Assert
    expect(() => createUtilisationReportForBanksJob.init()).toThrow();
  });

  it('has the correct job schedule', () => {
    // Act
    const job = createUtilisationReportForBanksJob.init();

    // Assert
    expect(job.schedule).toEqual(testSchedule);
  });

  it('has the correct job message', () => {
    // Act
    const job = createUtilisationReportForBanksJob.init();

    // Assert
    expect(job.message).toEqual('Create utilisation reports in the database for banks which have a report due');
  });

  describe('the task', () => {
    const getJob = () => createUtilisationReportForBanksJob.init();

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('does not try to create any utilisation reports when there are no banks', async () => {
      // Arrange
      const job = getJob();
      jest.mocked(getAllBanks).mockResolvedValue([]);
      const saveUtilisationReportDetailsSpy = jest.spyOn(utilisationReportsRepo, 'saveUtilisationReportDetails');

      // Act
      await job.task(new Date());

      // Assert
      expect(saveUtilisationReportDetailsSpy).not.toHaveBeenCalled();
    });

    it('does not try to create any utilisation reports when all the reports are up to date', async () => {
      // Arrange
      const job = getJob();
      const bank = { id: '123', name: 'Test bank' } as Bank;
      jest.mocked(getAllBanks).mockResolvedValue([bank]);
      jest.mocked(utilisationReportsRepo.getCurrentUtilisationReportByBankId).mockResolvedValue({} as UtilisationReport);
      const getCurrentUtilisationReportByBankIdSpy = jest.spyOn(utilisationReportsRepo, 'getCurrentUtilisationReportByBankId');
      const saveNewUtilisationReportAsSystemUserSpy = jest.spyOn(utilisationReportsRepo, 'saveNewUtilisationReportAsSystemUser');

      // Act
      await job.task(new Date());

      // Assert
      expect(getCurrentUtilisationReportByBankIdSpy).toHaveBeenCalledWith(bank.id);
      expect(saveNewUtilisationReportAsSystemUserSpy).not.toHaveBeenCalled();
    });

    it('tries to create utilisation reports for all banks which do not have a report', async () => {
      // Arrange
      const job = getJob();
      const banks = [{ id: '1' }, { id: '2' }, { id: '3' }] as Bank[];
      jest.mocked(getAllBanks).mockResolvedValue(banks);
      jest.mocked(utilisationReportsRepo.getCurrentUtilisationReportByBankId).mockResolvedValue(null);
      jest.mocked(getCurrentReportPeriodForBankSchedule).mockReturnValue({} as ReportPeriod);
      const getCurrentUtilisationReportByBankIdSpy = jest.spyOn(utilisationReportsRepo, 'getCurrentUtilisationReportByBankId');   
      const saveNewUtilisationReportAsSystemUserSpy = jest.spyOn(utilisationReportsRepo, 'saveNewUtilisationReportAsSystemUser');

      // Act
      await job.task(new Date());

      // Assert
      expect(getCurrentUtilisationReportByBankIdSpy).toHaveBeenCalledTimes(banks.length);
      banks.forEach(({ id }) => expect(getCurrentUtilisationReportByBankIdSpy).toHaveBeenCalledWith(id));
      expect(saveNewUtilisationReportAsSystemUserSpy).toHaveBeenCalledTimes(banks.length);
    });
  });
});
