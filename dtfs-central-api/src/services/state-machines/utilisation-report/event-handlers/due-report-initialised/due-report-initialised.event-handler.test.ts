import { REQUEST_PLATFORM_TYPE, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { handleUtilisationReportDueReportInitialisedEvent } from './due-report-initialised.event-handler';
import { UtilisationReportRepo } from '../../../../../repositories/utilisation-reports-repo';

jest.mock('../../../../../repositories/utilisation-reports-repo');

describe('handleUtilisationReportDueReportInitialisedEvent', () => {
  const bankId = '956';
  const reportPeriod = {
    start: { month: 12, year: 2023 },
    end: { month: 1, year: 2024 },
  };
  const requestSource = { platform: REQUEST_PLATFORM_TYPE.SYSTEM };

  it('should create a not received report and save it', async () => {
    // Arrange
    const saveReportSpy = jest.spyOn(UtilisationReportRepo, 'save');

    // Act
    await handleUtilisationReportDueReportInitialisedEvent({ bankId, reportPeriod, requestSource });

    // Assert
    const expectedCreatedReport = UtilisationReportEntity.createNotReceived({
      bankId,
      reportPeriod,
      requestSource,
    });

    expect(saveReportSpy).toHaveBeenCalledTimes(1);
    expect(saveReportSpy).toHaveBeenCalledWith(expectedCreatedReport);
  });
});
