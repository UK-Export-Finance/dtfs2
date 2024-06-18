import httpMocks from 'node-mocks-http';
import difference from 'lodash.difference';
import { FEE_RECORD_STATUS, SessionBank } from '@ukef/dtfs2-common';
import { postCheckKeyingData } from '.';
import { aTfmSessionUser } from '../../../../test-helpers/test-data/tfm-session-user';
import api from '../../../api';
import { CheckKeyingDataFeeRecordPaymentGroupViewModelItem, CheckKeyingDataViewModel } from '../../../types/view-models';
import { aFeeRecordItem, aFeeRecordPaymentGroup, aUtilisationReportReconciliationDetailsResponse } from '../../../../test-helpers';
import { UtilisationReportReconciliationDetailsResponseBody } from '../../../api-response-types';

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
      expect(res._getRenderView()).toBe('_partials/problem-with-service.njk');
      expect(res._getRenderData()).toEqual({ user: requestSession.user });
    });

    describe('when there are no matching fee record payment groups', () => {
      beforeEach(() => {
        jest.mocked(api.getUtilisationReportReconciliationDetailsById).mockResolvedValue({
          ...aUtilisationReportReconciliationDetailsResponse(),
          feeRecordPaymentGroups: [
            { ...aFeeRecordPaymentGroup(), status: 'DOES_NOT_MATCH' },
            { ...aFeeRecordPaymentGroup(), status: 'TO_DO' },
            { ...aFeeRecordPaymentGroup(), status: 'TO_DO' },
          ],
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
        expect(req.session.generateKeyingDataErrorKey).toBe('no-matching-fee-records');
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
        expect(res._getRedirectUrl()).toBe(`/utilisation-reports/${reportId}`);
        expect(res._isEndCalled()).toBe(true);
      });
    });

    describe('when there are matching fee record payment groups', () => {
      beforeEach(() => {
        jest.mocked(api.getUtilisationReportReconciliationDetailsById).mockResolvedValue({
          ...aUtilisationReportReconciliationDetailsResponse(),
          feeRecordPaymentGroups: [
            { ...aFeeRecordPaymentGroup(), status: 'DOES_NOT_MATCH' },
            { ...aFeeRecordPaymentGroup(), status: 'TO_DO' },
            { ...aFeeRecordPaymentGroup(), status: 'MATCH' },
          ],
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
        expect(res._getRenderView()).toBe('utilisation-reports/check-keying-data.njk');
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
        const utilisationReportResponse: UtilisationReportReconciliationDetailsResponseBody = {
          ...aUtilisationReportReconciliationDetailsResponse(),
          feeRecordPaymentGroups: [{ ...aFeeRecordPaymentGroup(), status: 'MATCH' }],
          bank,
        };
        jest.mocked(api.getUtilisationReportReconciliationDetailsById).mockResolvedValue(utilisationReportResponse);

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

        const utilisationReportResponse: UtilisationReportReconciliationDetailsResponseBody = {
          ...aUtilisationReportReconciliationDetailsResponse(),
          feeRecordPaymentGroups: [{ ...aFeeRecordPaymentGroup(), status: 'MATCH' }],
          reportPeriod: {
            start: { month: 1, year: 2024 },
            end: { month: 1, year: 2024 },
          },
        };
        jest.mocked(api.getUtilisationReportReconciliationDetailsById).mockResolvedValue(utilisationReportResponse);

        // Act
        await postCheckKeyingData(req, res);

        // Assert
        const viewModel = res._getRenderData() as CheckKeyingDataViewModel;
        expect(viewModel.formattedReportPeriod).toBe('January 2024');
      });

      it('renders the page with the mapped fee record payment groups', async () => {
        // Arrange
        const { req, res } = httpMocks.createMocks({
          session: requestSession,
          params: { reportId: '1' },
        });

        const utilisationReportResponse: UtilisationReportReconciliationDetailsResponseBody = {
          ...aUtilisationReportReconciliationDetailsResponse(),
          feeRecordPaymentGroups: [
            {
              feeRecords: [
                {
                  id: 1,
                  facilityId: '12345678',
                  exporter: 'Test exporter',
                  reportedFees: { currency: 'EUR', amount: 100 },
                  reportedPayments: { currency: 'GBP', amount: 90.91 },
                },
              ],
              totalReportedPayments: { currency: 'GBP', amount: 90.91 },
              paymentsReceived: null,
              totalPaymentsReceived: null,
              status: 'MATCH',
            },
          ],
        };
        jest.mocked(api.getUtilisationReportReconciliationDetailsById).mockResolvedValue(utilisationReportResponse);

        // Act
        await postCheckKeyingData(req, res);

        // Assert
        const viewModel = res._getRenderData() as CheckKeyingDataViewModel;
        expect(viewModel.feeRecordPaymentGroups).toHaveLength(1);
        expect(viewModel.feeRecordPaymentGroups[0]).toEqual<CheckKeyingDataFeeRecordPaymentGroupViewModelItem>({
          feeRecords: [
            {
              id: 1,
              facilityId: '12345678',
              exporter: 'Test exporter',
              reportedFees: 'EUR 100.00',
              reportedPayments: 'GBP 90.91',
            },
          ],
          paymentsReceived: undefined,
          status: 'MATCH',
          displayStatus: 'MATCH',
        });
      });

      it.each(difference(Object.values(FEE_RECORD_STATUS), [FEE_RECORD_STATUS.MATCH]))(
        "does not render fee record payment groups with the status '%s'",
        async (status) => {
          // Arrange
          const { req, res } = httpMocks.createMocks({
            session: requestSession,
            params: { reportId: '1' },
          });

          const utilisationReportResponse: UtilisationReportReconciliationDetailsResponseBody = {
            ...aUtilisationReportReconciliationDetailsResponse(),
            feeRecordPaymentGroups: [
              {
                ...aFeeRecordPaymentGroup(),
                status,
              },
              {
                ...aFeeRecordPaymentGroup(),
                status: 'MATCH',
              },
            ],
          };
          jest.mocked(api.getUtilisationReportReconciliationDetailsById).mockResolvedValue(utilisationReportResponse);

          // Act
          await postCheckKeyingData(req, res);

          // Assert
          const viewModel = res._getRenderData() as CheckKeyingDataViewModel;
          expect(viewModel.feeRecordPaymentGroups).toHaveLength(1);
          expect(viewModel.feeRecordPaymentGroups[0].status).toBe(FEE_RECORD_STATUS.MATCH);
        },
      );

      it('sets the view model number of matching facilities property to the number of fee records in matching groups', async () => {
        // Arrange
        const { req, res } = httpMocks.createMocks({
          session: requestSession,
          params: { reportId: '1' },
        });

        const utilisationReportResponse: UtilisationReportReconciliationDetailsResponseBody = {
          ...aUtilisationReportReconciliationDetailsResponse(),
          feeRecordPaymentGroups: [
            {
              ...aFeeRecordPaymentGroup(),
              feeRecords: [{ ...aFeeRecordItem() }, { ...aFeeRecordItem() }],
              status: 'DOES_NOT_MATCH',
            },
            {
              ...aFeeRecordPaymentGroup(),
              feeRecords: [{ ...aFeeRecordItem() }, { ...aFeeRecordItem() }, { ...aFeeRecordItem() }],
              status: 'MATCH',
            },
          ],
        };
        jest.mocked(api.getUtilisationReportReconciliationDetailsById).mockResolvedValue(utilisationReportResponse);

        // Act
        await postCheckKeyingData(req, res);

        // Assert
        const viewModel = res._getRenderData() as CheckKeyingDataViewModel;
        expect(viewModel.feeRecordPaymentGroups).toHaveLength(1);
        expect(viewModel.numberOfMatchingFacilities).toBe(3);
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
        expect(viewModel.reportId).toBe(reportId);
      });
    });
  });
});
