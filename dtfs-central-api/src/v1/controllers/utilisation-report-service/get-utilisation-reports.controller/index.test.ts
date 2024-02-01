import httpMocks from 'node-mocks-http';
import { GetUtilisationReportsRequest, getUtilisationReports } from './index';
import { getManyUtilisationReportDetailsByBankId } from '../../../../services/repositories/utilisation-reports-repo';
import { UtilisationReport } from '../../../../types/db-models/utilisation-reports';
import { ReportPeriod, UtilisationReportReconciliationStatus } from '../../../../types/utilisation-reports';

jest.mock('../../../../services/repositories/utilisation-reports-repo');

console.error = jest.fn();

describe('getUtilisationReports', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const bankId = '123';
  const getHttpMocks = (queryOpts: Partial<GetUtilisationReportsRequest['query']>) =>
    httpMocks.createMocks<GetUtilisationReportsRequest>({
      params: { bankId },
      query: {
        reportPeriod: queryOpts.reportPeriod ?? undefined,
        reportStatuses: queryOpts.reportStatuses ?? undefined,
      },
    });

  it('returns a 500 response if any errors are thrown', async () => {
    // Arrange
    const { req, res } = getHttpMocks({});

    jest.mocked(getManyUtilisationReportDetailsByBankId).mockRejectedValue(new Error());

    // Act
    await getUtilisationReports(req, res);

    // Assert
    expect(res.statusCode).toEqual(500);
  });

  it('calls the repo method with the correct filter when no queries are defined', async () => {
    // Arrange
    const { req, res } = getHttpMocks({});

    const mockUtilisationReports: UtilisationReport[] = [];
    jest.mocked(getManyUtilisationReportDetailsByBankId).mockResolvedValue(mockUtilisationReports);

    // Act
    await getUtilisationReports(req, res);

    // Assert
    expect(getManyUtilisationReportDetailsByBankId).toHaveBeenCalledWith(bankId, {
      reportPeriod: undefined,
      reportStatuses: undefined,
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
    const validReportPeriodJson = JSON.stringify(validReportPeriod);

    const mockUtilisationReports: UtilisationReport[] = [];
    jest.mocked(getManyUtilisationReportDetailsByBankId).mockResolvedValue(mockUtilisationReports);

    const { req, res } = getHttpMocks({ reportPeriod: validReportPeriodJson });

    // Act
    await getUtilisationReports(req, res);

    // Assert
    expect(getManyUtilisationReportDetailsByBankId).toHaveBeenCalledWith(bankId, {
      reportPeriod: validReportPeriod,
      reportStatuses: undefined,
    });

    expect(res.statusCode).toEqual(200);
    // eslint-disable-next-line no-underscore-dangle
    expect(res._getData()).toEqual(mockUtilisationReports);
  });

  it('calls the repo method with the correct values and sends a 200 when a report statuses query is defined', async () => {
    // Arrange
    const validReportStatuses: UtilisationReportReconciliationStatus[] = ['RECONCILIATION_COMPLETED', 'PENDING_RECONCILIATION'];

    const mockUtilisationReports: UtilisationReport[] = [];
    jest.mocked(getManyUtilisationReportDetailsByBankId).mockResolvedValue(mockUtilisationReports);

    const { req, res } = getHttpMocks({ reportStatuses: validReportStatuses });

    // Act
    await getUtilisationReports(req, res);

    // Assert
    expect(getManyUtilisationReportDetailsByBankId).toHaveBeenCalledWith(bankId, {
      reportStatuses: validReportStatuses,
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
    const validReportPeriodJson = JSON.stringify(validReportPeriod);

    const validReportStatuses: UtilisationReportReconciliationStatus[] = ['RECONCILIATION_COMPLETED', 'PENDING_RECONCILIATION'];

    const mockUtilisationReports: UtilisationReport[] = [];
    jest.mocked(getManyUtilisationReportDetailsByBankId).mockResolvedValue(mockUtilisationReports);

    const { req, res } = getHttpMocks({ reportPeriod: validReportPeriodJson, reportStatuses: validReportStatuses });

    // Act
    await getUtilisationReports(req, res);

    // Assert
    expect(getManyUtilisationReportDetailsByBankId).toHaveBeenCalledWith(bankId, {
      reportPeriod: validReportPeriod,
      reportStatuses: validReportStatuses,
    });

    expect(res.statusCode).toEqual(200);
    // eslint-disable-next-line no-underscore-dangle
    expect(res._getData()).toEqual(mockUtilisationReports);
  });
});
