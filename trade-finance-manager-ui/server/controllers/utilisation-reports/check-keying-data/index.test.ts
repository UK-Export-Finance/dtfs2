import httpMocks from 'node-mocks-http';
import { CURRENCY, FEE_RECORD_STATUS, SessionBank } from '@ukef/dtfs2-common';
import { postCheckKeyingData } from '.';
import { aTfmSessionUser } from '../../../../test-helpers/test-data/tfm-session-user';
import api from '../../../api';
import { CheckKeyingDataViewModel, FeeRecordToKeyViewModelItem } from '../../../types/view-models';
import { aFeeRecordsToKeyResponseBody } from '../../../../test-helpers';
import { FeeRecordToKey, FeeRecordsToKeyResponseBody } from '../../../api-response-types';

console.error = jest.fn();

jest.mock('../../../api');

describe('controllers/utilisation-reports/check-keying-data', () => {
  describe('postCheckKeyingData', () => {
    const userToken = 'abc123';
    const requestSession = {
      user: aTfmSessionUser(),
      userToken,
    };

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('renders the problem-with-service page when an error occurs', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId: '1' },
      });

      jest.mocked(api.getUtilisationReportReconciliationDetailsById).mockRejectedValue(new Error('Some error'));

      // Act
      await postCheckKeyingData(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
      expect(res._getRenderData()).toEqual({ user: requestSession.user });
    });

    describe('when there are no fee records to key', () => {
      beforeEach(() => {
        jest.mocked(api.getUtilisationReportWithFeeRecordsToKey).mockResolvedValue({
          ...aFeeRecordsToKeyResponseBody(),
          feeRecords: [],
        });
      });

      it('sets the request session generateKeyingDataErrorKey field', async () => {
        // Arrange
        const { req, res } = httpMocks.createMocks({
          session: requestSession,
          params: { reportId: '1' },
        });

        // Act
        await postCheckKeyingData(req, res);

        // Assert
        expect(req.session.generateKeyingDataErrorKey).toEqual('no-matching-fee-records');
      });

      it("redirects to '/utilisation-reports/:reportId'", async () => {
        // Arrange
        const reportId = '12';
        const { req, res } = httpMocks.createMocks({
          session: requestSession,
          params: { reportId },
        });

        // Act
        await postCheckKeyingData(req, res);

        // Assert
        expect(res._getRedirectUrl()).toEqual(`/utilisation-reports/${reportId}`);
        expect(res._isEndCalled()).toEqual(true);
      });
    });

    describe('when there are fee records to key', () => {
      const aFeeRecordToKey = (): FeeRecordToKey => ({
        id: 1,
        facilityId: '12345678',
        exporter: 'Test exporter',
        reportedFees: { currency: 'EUR', amount: 100 },
        reportedPayments: { currency: CURRENCY.GBP, amount: 90.91 },
        paymentsReceived: [{ currency: CURRENCY.GBP, amount: 90.91 }],
        status: FEE_RECORD_STATUS.MATCH,
      });

      beforeEach(() => {
        jest.mocked(api.getUtilisationReportWithFeeRecordsToKey).mockResolvedValue({
          ...aFeeRecordsToKeyResponseBody(),
          feeRecords: [aFeeRecordToKey()],
        });
      });

      it("renders the 'check-keying-data' page", async () => {
        // Arrange
        const { req, res } = httpMocks.createMocks({
          session: requestSession,
          params: { reportId: '1' },
        });

        // Act
        await postCheckKeyingData(req, res);

        // Assert
        expect(res._getRenderView()).toEqual('utilisation-reports/check-keying-data.njk');
      });

      it('renders the page with the bank', async () => {
        // Arrange
        const { req, res } = httpMocks.createMocks({
          session: requestSession,
          params: { reportId: '1' },
        });

        const bank: SessionBank = {
          id: '123',
          name: 'Test bank',
        };
        const utilisationReportResponse: FeeRecordsToKeyResponseBody = {
          ...aFeeRecordsToKeyResponseBody(),
          feeRecords: [aFeeRecordToKey()],
          bank,
        };
        jest.mocked(api.getUtilisationReportWithFeeRecordsToKey).mockResolvedValue(utilisationReportResponse);

        // Act
        await postCheckKeyingData(req, res);

        // Assert
        const viewModel = res._getRenderData() as CheckKeyingDataViewModel;
        expect(viewModel.bank).toEqual(bank);
      });

      it('renders the page with the formatted report period', async () => {
        // Arrange
        const { req, res } = httpMocks.createMocks({
          session: requestSession,
          params: { reportId: '1' },
        });

        const utilisationReportResponse: FeeRecordsToKeyResponseBody = {
          ...aFeeRecordsToKeyResponseBody(),
          feeRecords: [aFeeRecordToKey()],
          reportPeriod: {
            start: { month: 1, year: 2024 },
            end: { month: 1, year: 2024 },
          },
        };
        jest.mocked(api.getUtilisationReportWithFeeRecordsToKey).mockResolvedValue(utilisationReportResponse);

        // Act
        await postCheckKeyingData(req, res);

        // Assert
        const viewModel = res._getRenderData() as CheckKeyingDataViewModel;
        expect(viewModel.formattedReportPeriod).toEqual('January 2024');
      });

      it('renders the page with the mapped fee records', async () => {
        // Arrange
        const { req, res } = httpMocks.createMocks({
          session: requestSession,
          params: { reportId: '1' },
        });

        const utilisationReportResponse: FeeRecordsToKeyResponseBody = {
          ...aFeeRecordsToKeyResponseBody(),
          feeRecords: [
            {
              id: 1,
              facilityId: '12345678',
              exporter: 'Test exporter',
              reportedFees: { currency: 'EUR', amount: 100 },
              reportedPayments: { currency: CURRENCY.GBP, amount: 90.91 },
              paymentsReceived: [{ currency: CURRENCY.GBP, amount: 90.91 }],
              status: FEE_RECORD_STATUS.MATCH,
            },
          ],
        };
        jest.mocked(api.getUtilisationReportWithFeeRecordsToKey).mockResolvedValue(utilisationReportResponse);

        // Act
        await postCheckKeyingData(req, res);

        // Assert
        const viewModel = res._getRenderData() as CheckKeyingDataViewModel;
        expect(viewModel.feeRecords).toHaveLength(1);
        expect(viewModel.feeRecords[0]).toEqual<FeeRecordToKeyViewModelItem>({
          id: 1,
          facilityId: '12345678',
          exporter: 'Test exporter',
          reportedFees: {
            formattedCurrencyAndAmount: 'EUR 100.00',
            dataSortValue: 0,
          },
          reportedPayments: {
            formattedCurrencyAndAmount: 'GBP 90.91',
            dataSortValue: 0,
          },
          paymentsReceived: ['GBP 90.91'],
          status: FEE_RECORD_STATUS.MATCH,
          displayStatus: 'MATCH',
        });
      });

      it('sets the view model number of matching facilities property to the number of fee records to key', async () => {
        // Arrange
        const { req, res } = httpMocks.createMocks({
          session: requestSession,
          params: { reportId: '1' },
        });

        const utilisationReportResponse: FeeRecordsToKeyResponseBody = {
          ...aFeeRecordsToKeyResponseBody(),
          feeRecords: [aFeeRecordToKey(), aFeeRecordToKey(), aFeeRecordToKey()],
        };
        jest.mocked(api.getUtilisationReportWithFeeRecordsToKey).mockResolvedValue(utilisationReportResponse);

        // Act
        await postCheckKeyingData(req, res);

        // Assert
        const viewModel = res._getRenderData() as CheckKeyingDataViewModel;
        expect(viewModel.feeRecords).toHaveLength(3);
        expect(viewModel.numberOfMatchingFacilities).toEqual(3);
      });

      it('sets the view model report id to path parameter report id', async () => {
        // Arrange
        const reportId = '51';
        const { req, res } = httpMocks.createMocks({
          session: requestSession,
          params: { reportId },
        });

        // Act
        await postCheckKeyingData(req, res);

        // Assert
        const viewModel = res._getRenderData() as CheckKeyingDataViewModel;
        expect(viewModel.reportId).toEqual(reportId);
      });
    });
  });
});
