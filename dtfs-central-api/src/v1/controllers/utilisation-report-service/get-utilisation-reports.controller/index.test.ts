import httpMocks from 'node-mocks-http';
import { ReportPeriod, UTILISATION_REPORT_RECONCILIATION_STATUS, UtilisationReportEntity, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { GetUtilisationReportsRequest, getUtilisationReports } from './index';
import { UtilisationReportRepo } from '../../../../repositories/utilisation-reports-repo';
import { GetUtilisationReportResponse } from '../../../../types/utilisation-reports';

jest.mock('../../../../repositories/utilisation-reports-repo');

jest.mock('../../../../repositories/utilisation-reports-repo/utilisation-report-sql.repo');

console.error = jest.fn();

describe('getUtilisationReports', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const bankId = '123';
  const getHttpMocks = (queryOpts?: Partial<GetUtilisationReportsRequest['query']>) =>
    httpMocks.createMocks<GetUtilisationReportsRequest>({
      params: { bankId },
      query: {
        reportPeriod: queryOpts?.reportPeriod ?? undefined,
        excludeNotReceived: queryOpts?.excludeNotReceived ?? false,
      },
    });

  const getReportPeriodJsonObject = (reportPeriod: ReportPeriod) => ({
    start: {
      month: reportPeriod.start.month.toString(),
      year: reportPeriod.start.year.toString(),
    },
    end: {
      month: reportPeriod.end.month.toString(),
      year: reportPeriod.end.year.toString(),
    },
  });

  it('returns a 500 response if any errors are thrown', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    jest.spyOn(UtilisationReportRepo, 'findAllByBankId').mockImplementation(jest.fn().mockRejectedValue(new Error()));

    // Act
    await getUtilisationReports(req, res);

    // Assert
    expect(res.statusCode).toEqual(500);
  });

  it('calls the repo method with the correct filter when no queries are defined', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    const mockUtilisationReports: UtilisationReportEntity[] = [];
    const findAllByBankIdMock = jest.fn().mockResolvedValue(mockUtilisationReports);
    jest.spyOn(UtilisationReportRepo, 'findAllByBankId').mockImplementation(findAllByBankIdMock);

    // Act
    await getUtilisationReports(req, res);

    // Assert
    expect(findAllByBankIdMock).toHaveBeenCalledWith(bankId, {
      reportPeriod: undefined,
      excludeNotReceived: false,
    });

    expect(res.statusCode).toEqual(200);
    // eslint-disable-next-line no-underscore-dangle
    expect(res._getData()).toEqual(mockUtilisationReports);
  });

  it('calls the repo method with the correct values and sends a 200 when a report period query is defined', async () => {
    // Arrange
    const validReportPeriod: ReportPeriod = {
      start: {
        month: 1,
        year: 2024,
      },
      end: {
        month: 2,
        year: 2025,
      },
    };

    const mockUtilisationReports: UtilisationReportEntity[] = [];
    const findAllByBankIdMock = jest.fn().mockResolvedValue(mockUtilisationReports);
    jest.spyOn(UtilisationReportRepo, 'findAllByBankId').mockImplementation(findAllByBankIdMock);

    const { req, res } = getHttpMocks({ reportPeriod: getReportPeriodJsonObject(validReportPeriod) });

    // Act
    await getUtilisationReports(req, res);

    // Assert
    expect(findAllByBankIdMock).toHaveBeenCalledWith(bankId, {
      reportPeriod: validReportPeriod,
      excludeNotReceived: false,
    });

    expect(res.statusCode).toEqual(200);
    // eslint-disable-next-line no-underscore-dangle
    expect(res._getData()).toEqual(mockUtilisationReports);
  });

  it("calls the repo method with the correct values and sends a 200 when the 'excludeNotReceived' query is defined", async () => {
    // Arrange
    const excludeNotReceived = 'true';

    const mockUtilisationReports: UtilisationReportEntity[] = [];
    const findAllByBankIdMock = jest.fn().mockResolvedValue(mockUtilisationReports);
    jest.spyOn(UtilisationReportRepo, 'findAllByBankId').mockImplementation(findAllByBankIdMock);

    const { req, res } = getHttpMocks({ excludeNotReceived });

    // Act
    await getUtilisationReports(req, res);

    // Assert
    expect(findAllByBankIdMock).toHaveBeenCalledWith(bankId, {
      excludeNotReceived: true,
      reportPeriod: undefined,
    });

    expect(res.statusCode).toEqual(200);
    // eslint-disable-next-line no-underscore-dangle
    expect(res._getData()).toEqual(mockUtilisationReports);
  });

  it('calls the repo method with the correct values and sends a 200 when all possible queries are defined', async () => {
    // Arrange
    const validReportPeriod: ReportPeriod = {
      start: {
        month: 1,
        year: 2024,
      },
      end: {
        month: 2,
        year: 2025,
      },
    };

    const excludeNotReceived = 'true';

    const mockUtilisationReports: UtilisationReportEntity[] = [];
    const findAllByBankIdMock = jest.fn().mockResolvedValue(mockUtilisationReports);
    jest.spyOn(UtilisationReportRepo, 'findAllByBankId').mockImplementation(findAllByBankIdMock);

    const { req, res } = getHttpMocks({ reportPeriod: getReportPeriodJsonObject(validReportPeriod), excludeNotReceived });

    // Act
    await getUtilisationReports(req, res);

    // Assert
    expect(findAllByBankIdMock).toHaveBeenCalledWith(bankId, {
      reportPeriod: validReportPeriod,
      excludeNotReceived: true,
    });

    expect(res.statusCode).toEqual(200);
    // eslint-disable-next-line no-underscore-dangle
    expect(res._getData()).toEqual(mockUtilisationReports);
  });

  it('maps entities to response', async () => {
    // Arrange
    const validReportPeriod: ReportPeriod = {
      start: {
        month: 1,
        year: 2024,
      },
      end: {
        month: 2,
        year: 2025,
      },
    };

    const excludeNotReceived = 'true';

    const mockUtilisationReports = [UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION).build()];
    const findAllByBankIdMock = jest.fn().mockResolvedValue(mockUtilisationReports);
    jest.spyOn(UtilisationReportRepo, 'findAllByBankId').mockImplementation(findAllByBankIdMock);

    const { req, res } = getHttpMocks({ reportPeriod: getReportPeriodJsonObject(validReportPeriod), excludeNotReceived });

    // Act
    await getUtilisationReports(req, res);

    // Assert
    expect(findAllByBankIdMock).toHaveBeenCalledWith(bankId, {
      reportPeriod: validReportPeriod,
      excludeNotReceived: true,
    });

    expect(res.statusCode).toEqual(200);
    // eslint-disable-next-line no-underscore-dangle
    const responseData = res._getData() as GetUtilisationReportResponse[];
    expect(responseData.length).toEqual(1);
    expect(responseData[0].id).toEqual(mockUtilisationReports[0].id);
    expect(responseData[0].bankId).toEqual(mockUtilisationReports[0].bankId);
    expect(responseData[0].uploadedByUserId).toEqual(mockUtilisationReports[0].uploadedByUserId);
    expect(responseData[0].dateUploaded).toEqual(mockUtilisationReports[0].dateUploaded);
    expect(responseData[0].status).toEqual(mockUtilisationReports[0].status);
    expect(responseData[0].azureFileInfo?.filename).toEqual(mockUtilisationReports[0].azureFileInfo?.filename);
    expect(responseData[0].azureFileInfo?.folder).toEqual(mockUtilisationReports[0].azureFileInfo?.folder);
    expect(responseData[0].azureFileInfo?.fullPath).toEqual(mockUtilisationReports[0].azureFileInfo?.fullPath);
    expect(responseData[0].azureFileInfo?.url).toEqual(mockUtilisationReports[0].azureFileInfo?.url);
    expect(responseData[0].azureFileInfo?.mimetype).toEqual(mockUtilisationReports[0].azureFileInfo?.mimetype);
    expect(responseData[0].reportPeriod.start.month).toEqual(mockUtilisationReports[0].reportPeriod.start.month);
    expect(responseData[0].reportPeriod.start.year).toEqual(mockUtilisationReports[0].reportPeriod.start.year);
    expect(responseData[0].reportPeriod.end.month).toEqual(mockUtilisationReports[0].reportPeriod.end.month);
    expect(responseData[0].reportPeriod.end.year).toEqual(mockUtilisationReports[0].reportPeriod.end.year);
  });
});
