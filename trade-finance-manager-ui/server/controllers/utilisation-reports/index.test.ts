import httpMocks from 'node-mocks-http';
import { mocked } from 'jest-mock';
import * as expressValidator from 'express-validator';
import api from '../../api';
import { getUtilisationReports, getUtilisationReportByBankId } from '.';
import MOCK_BANK_HOLIDAYS from '../../test-mocks/mock-bank-holidays';
import { MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY } from '../../test-mocks/mock-utilisation-report-reconciliation-summary';
import { UtilisationReportReconciliationSummaryItem } from '../../types/utilisation-reports';

jest.mock('../../api');
jest.mock('express-validator');

console.error = jest.fn();

const originalProcessEnv = process.env;

describe('controllers/utilisation-reports', () => {
  afterEach(() => {
    process.env = { ...originalProcessEnv };
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  describe('getUtilisationReports', () => {
    it("renders the 'problem-with-service' page on error", async () => {
      // Arrange
      const { res, req } = httpMocks.createMocks({
        session: { userToken: 'user-token' },
      });

      (api.getUkBankHolidays as jest.Mock).mockRejectedValue({
        response: { status: 404 },
      });

      // Act
      await getUtilisationReports(req, res);

      // Assert
      /* eslint-disable no-underscore-dangle */
      expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
      /* eslint-enable no-underscore-dangle */
    });

    it('renders the utilisation-reports.njk view with required data', async () => {
      // Arrange
      const { res, req } = httpMocks.createMocks({
        session: { userToken: 'user-token' },
      });

      process.env.UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH = '10';

      const today = new Date('2023-11-05');
      jest.useFakeTimers().setSystemTime(today);

      (api.getUkBankHolidays as jest.Mock).mockResolvedValue(MOCK_BANK_HOLIDAYS);
      (api.getUtilisationReportsReconciliationSummary as jest.Mock).mockResolvedValue(MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY);

      // Act
      await getUtilisationReports(req, res);

      // Assert
      /* eslint-disable no-underscore-dangle */
      expect(res._getRenderView()).toEqual('utilisation-reports/utilisation-reports.njk');
      expect(res._getRenderData()).toMatchObject({
        activePrimaryNavigation: 'utilisation reports',
        reportPeriod: 'October 2023',
        reportDueDate: '14 November 2023',
      });
      /* eslint-enable no-underscore-dangle */
    });
  });

  describe('getUtilisationReportByBankId', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error');
    const isEmptyMock = jest.fn();
    const arrayMock = jest.fn();
    const validationResultMock = () => ({
      isEmpty: isEmptyMock,
      array: arrayMock,
    } as unknown as expressValidator.Result<expressValidator.ValidationError>);

    beforeEach(() => {
      jest.spyOn(expressValidator, 'validationResult').mockImplementation(validationResultMock);
    });

    it("should render the 'problem-with-service' page if there are validation errors", async () => {
      // Arrange
      const bankId = '123';
      const { res, req } = httpMocks.createMocks({
        session: { userToken: 'user-token' },
        params: { id: bankId },
      });

      isEmptyMock.mockReturnValueOnce(false);
      arrayMock.mockReturnValueOnce([]);

      // Act
      await getUtilisationReportByBankId(req, res);

      // Assert
      /* eslint-disable no-underscore-dangle */
      expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
      /* eslint-enable no-underscore-dangle */
      expect(consoleErrorSpy).toHaveBeenLastCalledWith(`Error rendering utilisation for bank with id ${bankId}:`, []);
    });

    it("should render the 'problem-with-service' page if the bank id cannot be found", async () => {
      // Arrange
      const bankId = '123';
      const { res, req } = httpMocks.createMocks({
        session: { userToken: 'user-token' },
        params: { id: bankId },
      });

      isEmptyMock.mockReturnValueOnce(true);

      mocked(api.getUtilisationReportsReconciliationSummary).mockResolvedValue([{ bank: { id: '321', name: 'Test bank' } }] as UtilisationReportReconciliationSummaryItem[]);

      // Act
      await getUtilisationReportByBankId(req, res);

      // Assert
      /* eslint-disable no-underscore-dangle */
      expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
      /* eslint-enable no-underscore-dangle */
      expect(consoleErrorSpy).toHaveBeenLastCalledWith(`Error rendering utilisation for bank with id ${bankId}:`, new Error(`Bank with id ${bankId} not found`));
    });

    it('should render the correct page with the correct data', async () => {
      // Arrange
      const bankId = '123';
      const { res, req } = httpMocks.createMocks({
        session: { userToken: 'user-token' },
        params: { id: bankId },
      });

      isEmptyMock.mockReturnValueOnce(true);

      const bank = {
        id: bankId,
        name: 'Test Bank',
      };
      mocked(api.getUtilisationReportsReconciliationSummary).mockResolvedValue([{ bank }] as UtilisationReportReconciliationSummaryItem[]);

      const today = new Date('2023-11-05');
      jest.useFakeTimers().setSystemTime(today);

      mocked(api.getUkBankHolidays).mockResolvedValue(MOCK_BANK_HOLIDAYS);

      // Act
      await getUtilisationReportByBankId(req, res);

      // Assert
      /* eslint-disable no-underscore-dangle */
      expect(res._getRenderView()).toEqual('utilisation-reports/utilisation-report-for-bank.njk');
      expect(res._getRenderData()).toMatchObject({
        activePrimaryNavigation: 'utilisation reports',
        bank,
        reportPeriod: 'October 2023',
      });
      /* eslint-enable no-underscore-dangle */
    });
  });
});
