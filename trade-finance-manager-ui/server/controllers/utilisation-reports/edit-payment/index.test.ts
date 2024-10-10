import httpMocks from 'node-mocks-http';
import { Currency, CurrencyAndAmount, ReportPeriod, SessionBank } from '@ukef/dtfs2-common';
import { SessionData } from 'express-session';
import { MOCK_TFM_SESSION_USER } from '../../../test-mocks/mock-tfm-session-user';
import { PostEditPaymentRequest, getEditPayment, postEditPayment } from '.';
import api from '../../../api';
import { aPaymentDetailsWithFeeRecordsResponseBody, aTfmSessionUser, aPayment, aFeeRecord } from '../../../../test-helpers';
import { EMPTY_PAYMENT_ERRORS_VIEW_MODEL, EditPaymentFormRequestBody } from '../helpers';
import { RECONCILIATION_FOR_REPORT_TABS } from '../../../constants/reconciliation-for-report-tabs';
import { EditPaymentViewModel } from '../../../types/view-models/edit-payment-view-model';
import { ErrorSummaryViewModel, SortedAndFormattedCurrencyAndAmount } from '../../../types/view-models';
import { EditPaymentFormValues, ParsedEditPaymentFormValues } from '../../../types/edit-payment-form-values';

jest.mock('../../../api');

describe('controllers/utilisation-reports/edit-payment', () => {
  const aRequestSession = () => ({
    user: aTfmSessionUser(),
    userToken: 'abc123',
  });

  beforeEach(() => {
    jest.mocked(api.getPaymentDetailsWithFeeRecords).mockResolvedValue(aPaymentDetailsWithFeeRecordsResponseBody());
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getEditPayment', () => {
    const userToken = 'user-token';
    const user = MOCK_TFM_SESSION_USER;
    const session = { userToken, user };

    const reportId = '12';
    const paymentId = '34';

    const getHttpMocksWithSessionData = (sessionData: Partial<SessionData>) =>
      httpMocks.createMocks({
        session: { ...session, ...sessionData },
        params: {
          reportId,
          paymentId,
        },
      });

    const getHttpMocks = () =>
      httpMocks.createMocks({
        params: { reportId, paymentId },
        session: aRequestSession(),
      });

    it('renders the edit payment page', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await getEditPayment(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-reports/edit-payment.njk');
    });

    it('sets the render view model reportId to the request params reportId', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await getEditPayment(req, res);

      // Assert
      const viewModel = res._getRenderData() as EditPaymentViewModel;
      expect(viewModel.reportId).toEqual(reportId);
    });

    it('sets the render view model paymentId to the request params paymentId', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await getEditPayment(req, res);

      // Assert
      const viewModel = res._getRenderData() as EditPaymentViewModel;
      expect(viewModel.paymentId).toEqual(paymentId);
    });

    describe('when the remove fees from payment error key is set in the session data', () => {
      it('sets remove fees from payment error summary based on the payment error key', async () => {
        // Arrange
        const sessionData: Partial<SessionData> = {
          removeFeesFromPaymentErrorKey: 'no-fee-records-selected',
        };
        const { req, res } = getHttpMocksWithSessionData(sessionData);

        jest.mocked(api.getPaymentDetailsWithFeeRecords).mockResolvedValue({
          ...aPaymentDetailsWithFeeRecordsResponseBody(),
        });

        // Act
        await getEditPayment(req, res);

        // Assert
        expect(res._getRenderView()).toEqual('utilisation-reports/edit-payment.njk');
        const viewModel = res._getRenderData() as EditPaymentViewModel;
        expect(viewModel.errors.errorSummary).toBeDefined();
        expect((viewModel.errors.errorSummary as [ErrorSummaryViewModel])[0].href).toEqual('#added-reported-fees-details-header');
        expect((viewModel.errors.errorSummary as [ErrorSummaryViewModel])[0].text).toEqual('Select fee or fees to remove from the payment');
      });

      it("sets the render view model feeRecords isChecked to false for every fee record when the key is 'no-fee-records-selected'", async () => {
        // Arrange
        const sessionData: Partial<SessionData> = {
          removeFeesFromPaymentErrorKey: 'no-fee-records-selected',
        };
        const { req, res } = getHttpMocksWithSessionData(sessionData);

        const feeRecords = [aFeeRecord(), aFeeRecord(), aFeeRecord(), aFeeRecord()];

        jest.mocked(api.getPaymentDetailsWithFeeRecords).mockResolvedValue({
          ...aPaymentDetailsWithFeeRecordsResponseBody(),
          feeRecords,
        });

        // Act
        await getEditPayment(req, res);

        // Assert
        const viewModel = res._getRenderData() as EditPaymentViewModel;
        expect(viewModel.feeRecords).toHaveLength(feeRecords.length);
        viewModel.feeRecords.forEach(({ isChecked }) => expect(isChecked).toEqual(false));
      });

      it("sets the render view model feeRecords isChecked to false for every fee record when the key is 'all-fee-records-selected'", async () => {
        // Arrange
        const sessionData: Partial<SessionData> = {
          removeFeesFromPaymentErrorKey: 'all-fee-records-selected',
        };
        const { req, res } = getHttpMocksWithSessionData(sessionData);

        const feeRecords = [aFeeRecord(), aFeeRecord(), aFeeRecord(), aFeeRecord()];

        jest.mocked(api.getPaymentDetailsWithFeeRecords).mockResolvedValue({
          ...aPaymentDetailsWithFeeRecordsResponseBody(),
          feeRecords,
        });

        // Act
        await getEditPayment(req, res);

        // Assert
        const viewModel = res._getRenderData() as EditPaymentViewModel;
        expect(viewModel.feeRecords).toHaveLength(feeRecords.length);
        viewModel.feeRecords.forEach(({ isChecked }) => expect(isChecked).toEqual(true));
      });
    });

    it('sets the render view model paymentCurrency to the edit payment details response payment currency', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const paymentCurrency: Currency = 'USD';

      jest.mocked(api.getPaymentDetailsWithFeeRecords).mockResolvedValue({
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        payment: {
          ...aPayment(),
          currency: paymentCurrency,
        },
      });

      // Act
      await getEditPayment(req, res);

      // Assert
      const viewModel = res._getRenderData() as EditPaymentViewModel;
      expect(viewModel.paymentCurrency).toEqual(paymentCurrency);
    });

    it('sets the render view model bank to the edit payment details response bank', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const bank: SessionBank = { id: '123', name: 'Test bank' };

      jest.mocked(api.getPaymentDetailsWithFeeRecords).mockResolvedValue({
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        bank,
      });

      // Act
      await getEditPayment(req, res);

      // Assert
      const viewModel = res._getRenderData() as EditPaymentViewModel;
      expect(viewModel.bank).toEqual(bank);
    });

    it('sets the render view model formattedReportPeriod to the formatted edit payment details response report period', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const reportPeriod: ReportPeriod = {
        start: { month: 1, year: 2024 },
        end: { month: 1, year: 2024 },
      };
      const formattedReportPeriod = 'January 2024';

      jest.mocked(api.getPaymentDetailsWithFeeRecords).mockResolvedValue({
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        reportPeriod,
      });

      // Act
      await getEditPayment(req, res);

      // Assert
      const viewModel = res._getRenderData() as EditPaymentViewModel;
      expect(viewModel.formattedReportPeriod).toEqual(formattedReportPeriod);
    });

    it('sets the render view model feeRecords id to the edit payment details response feeRecords id', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const feeRecordIds = [1, 2];
      const feeRecords = feeRecordIds.map((id) => ({ ...aFeeRecord(), id }));

      jest.mocked(api.getPaymentDetailsWithFeeRecords).mockResolvedValue({
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        feeRecords,
      });

      // Act
      await getEditPayment(req, res);

      // Assert
      const viewModel = res._getRenderData() as EditPaymentViewModel;
      expect(viewModel.feeRecords).toHaveLength(feeRecordIds.length);
      viewModel.feeRecords.forEach(({ id }, index) => expect(id).toEqual(feeRecordIds[index]));
    });

    it('sets the render view model feeRecords facilityId to the edit payment details response feeRecords facilityId', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const feeRecordFacilityIds = ['12345678', '87654321'];
      const feeRecords = feeRecordFacilityIds.map((facilityId) => ({ ...aFeeRecord(), facilityId }));

      jest.mocked(api.getPaymentDetailsWithFeeRecords).mockResolvedValue({
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        feeRecords,
      });

      // Act
      await getEditPayment(req, res);

      // Assert
      const viewModel = res._getRenderData() as EditPaymentViewModel;
      expect(viewModel.feeRecords).toHaveLength(feeRecordFacilityIds.length);
      viewModel.feeRecords.forEach(({ facilityId }, index) => expect(facilityId).toEqual(feeRecordFacilityIds[index]));
    });

    it('sets the render view model feeRecords exporter to the edit payment details response feeRecords exporter', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const feeRecordExporters = ['12345678', '87654321'];
      const feeRecords = feeRecordExporters.map((exporter) => ({ ...aFeeRecord(), exporter }));

      jest.mocked(api.getPaymentDetailsWithFeeRecords).mockResolvedValue({
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        feeRecords,
      });

      // Act
      await getEditPayment(req, res);

      // Assert
      const viewModel = res._getRenderData() as EditPaymentViewModel;
      expect(viewModel.feeRecords).toHaveLength(feeRecordExporters.length);
      viewModel.feeRecords.forEach(({ exporter }, index) => expect(exporter).toEqual(feeRecordExporters[index]));
    });

    it('sets the render view model feeRecords reportedFees to the edit payment details response feeRecords sorted and formatted reportedFees', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const feeRecordReportedFees: CurrencyAndAmount[] = [
        { currency: 'GBP', amount: 100 },
        { currency: 'EUR', amount: 50 },
      ];
      const formattedReportedFees: SortedAndFormattedCurrencyAndAmount[] = [
        { formattedCurrencyAndAmount: 'GBP 100.00', dataSortValue: 1 },
        { formattedCurrencyAndAmount: 'EUR 50.00', dataSortValue: 0 },
      ];
      const feeRecords = feeRecordReportedFees.map((reportedFees) => ({ ...aFeeRecord(), reportedFees }));

      jest.mocked(api.getPaymentDetailsWithFeeRecords).mockResolvedValue({
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        feeRecords,
      });

      // Act
      await getEditPayment(req, res);

      // Assert
      const viewModel = res._getRenderData() as EditPaymentViewModel;
      expect(viewModel.feeRecords).toHaveLength(feeRecordReportedFees.length);
      viewModel.feeRecords.forEach(({ reportedFees }, index) => expect(reportedFees).toEqual(formattedReportedFees[index]));
    });

    it('sets the render view model feeRecords reportedPayments to the edit payment details response feeRecords sorted and formatted reportedPayments', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const feeRecordReportedPayments: CurrencyAndAmount[] = [
        { currency: 'GBP', amount: 100 },
        { currency: 'EUR', amount: 50 },
      ];
      const formattedReportedPayments: SortedAndFormattedCurrencyAndAmount[] = [
        { formattedCurrencyAndAmount: 'GBP 100.00', dataSortValue: 1 },
        { formattedCurrencyAndAmount: 'EUR 50.00', dataSortValue: 0 },
      ];
      const feeRecords = feeRecordReportedPayments.map((reportedPayments) => ({ ...aFeeRecord(), reportedPayments }));

      jest.mocked(api.getPaymentDetailsWithFeeRecords).mockResolvedValue({
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        feeRecords,
      });

      // Act
      await getEditPayment(req, res);

      // Assert
      const viewModel = res._getRenderData() as EditPaymentViewModel;
      expect(viewModel.feeRecords).toHaveLength(feeRecordReportedPayments.length);
      viewModel.feeRecords.forEach(({ reportedPayments }, index) => expect(reportedPayments).toEqual(formattedReportedPayments[index]));
    });

    it("sets the render view model feeRecords checkboxId to 'feeRecordId-' followed by the fee record id", async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const feeRecordIds = [1, 2];
      const feeRecords = feeRecordIds.map((id) => ({ ...aFeeRecord(), id }));

      jest.mocked(api.getPaymentDetailsWithFeeRecords).mockResolvedValue({
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        feeRecords,
      });

      // Act
      await getEditPayment(req, res);

      // Assert
      const viewModel = res._getRenderData() as EditPaymentViewModel;
      expect(viewModel.feeRecords).toHaveLength(feeRecordIds.length);
      viewModel.feeRecords.forEach(({ checkboxId }, index) => expect(checkboxId).toEqual(`feeRecordId-${feeRecordIds[index]}`));
    });

    it('sets the render view model feeRecords isChecked to false for every fee record', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const feeRecords = [aFeeRecord(), aFeeRecord(), aFeeRecord(), aFeeRecord()];

      jest.mocked(api.getPaymentDetailsWithFeeRecords).mockResolvedValue({
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        feeRecords,
      });

      // Act
      await getEditPayment(req, res);

      // Assert
      const viewModel = res._getRenderData() as EditPaymentViewModel;
      expect(viewModel.feeRecords).toHaveLength(feeRecords.length);
      viewModel.feeRecords.forEach(({ isChecked }) => expect(isChecked).toEqual(false));
    });

    it('sets the render view model totalReportedPayments to the edit payment details response formatted totalReportedPayments', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const totalReportedPayments: CurrencyAndAmount = { currency: 'USD', amount: 314.59 };
      jest.mocked(api.getPaymentDetailsWithFeeRecords).mockResolvedValue({
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        totalReportedPayments,
      });

      // Act
      await getEditPayment(req, res);

      // Assert
      const viewModel = res._getRenderData() as EditPaymentViewModel;
      expect(viewModel.totalReportedPayments).toEqual('USD 314.59');
    });

    it('sets the render view model errors to the empty errors', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await getEditPayment(req, res);

      // Assert
      const viewModel = res._getRenderData() as EditPaymentViewModel;
      expect(viewModel.errors).toEqual(EMPTY_PAYMENT_ERRORS_VIEW_MODEL);
    });

    describe('when the edit payment form values are set in the session data', () => {
      it('sets the render view model formValues based on the edit payment form values in the session data', async () => {
        // Arrange
        const editPaymentFormValues: EditPaymentFormValues = {
          paymentAmount: '7',
          paymentDate: {
            day: '1',
            month: '2',
            year: '2023',
          },
          paymentReference: 'A payment reference',
        };
        const sessionData: Partial<SessionData> = {
          editPaymentFormValues,
        };
        const { req, res } = getHttpMocksWithSessionData(sessionData);

        jest.mocked(api.getPaymentDetailsWithFeeRecords).mockResolvedValue({
          ...aPaymentDetailsWithFeeRecordsResponseBody(),
        });

        // Act
        await getEditPayment(req, res);

        // Assert
        expect(res._getRenderView()).toEqual('utilisation-reports/edit-payment.njk');
        const viewModel = res._getRenderData() as EditPaymentViewModel;
        expect(viewModel.formValues).toEqual(editPaymentFormValues);
      });
    });

    describe('when the edit payment form values are undefined in the session data', () => {
      it('sets the render view model formValues paymentAmount to the edit payment details response payment amount', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        const paymentAmount = 100;
        jest.mocked(api.getPaymentDetailsWithFeeRecords).mockResolvedValue({
          ...aPaymentDetailsWithFeeRecordsResponseBody(),
          payment: {
            ...aPayment(),
            amount: paymentAmount,
          },
        });

        // Act
        await getEditPayment(req, res);

        // Assert
        const viewModel = res._getRenderData() as EditPaymentViewModel;
        expect(viewModel.formValues.paymentAmount).toEqual(paymentAmount.toString());
      });

      it('sets the render view model formValues paymentDate day to the edit payment details response payment dateReceived day', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        const day = '10';
        const dateReceived = new Date(`2024-05-${day}`).toISOString();
        jest.mocked(api.getPaymentDetailsWithFeeRecords).mockResolvedValue({
          ...aPaymentDetailsWithFeeRecordsResponseBody(),
          payment: {
            ...aPayment(),
            dateReceived,
          },
        });

        // Act
        await getEditPayment(req, res);

        // Assert
        const viewModel = res._getRenderData() as EditPaymentViewModel;
        expect(viewModel.formValues.paymentDate.day).toEqual(day);
      });

      it('sets the render view model formValues paymentDate month to the edit payment details response payment dateReceived month', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        const month = '5';
        const dateReceived = new Date(`2024-${month}-1`).toISOString();
        jest.mocked(api.getPaymentDetailsWithFeeRecords).mockResolvedValue({
          ...aPaymentDetailsWithFeeRecordsResponseBody(),
          payment: {
            ...aPayment(),
            dateReceived,
          },
        });

        // Act
        await getEditPayment(req, res);

        // Assert
        const viewModel = res._getRenderData() as EditPaymentViewModel;
        expect(viewModel.formValues.paymentDate.month).toEqual(month);
      });

      it('sets the render view model formValues paymentDate year to the edit payment details response payment dateReceived year', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        const year = '2024';
        const dateReceived = new Date(`${year}-5-1`).toISOString();
        jest.mocked(api.getPaymentDetailsWithFeeRecords).mockResolvedValue({
          ...aPaymentDetailsWithFeeRecordsResponseBody(),
          payment: {
            ...aPayment(),
            dateReceived,
          },
        });

        // Act
        await getEditPayment(req, res);

        // Assert
        const viewModel = res._getRenderData() as EditPaymentViewModel;
        expect(viewModel.formValues.paymentDate.year).toEqual(year);
      });

      it('sets the render view model formValues paymentReference to the edit payment details response payment reference', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        const reference = 'A payment reference';
        jest.mocked(api.getPaymentDetailsWithFeeRecords).mockResolvedValue({
          ...aPaymentDetailsWithFeeRecordsResponseBody(),
          payment: {
            ...aPayment(),
            reference,
          },
        });

        // Act
        await getEditPayment(req, res);

        // Assert
        const viewModel = res._getRenderData() as EditPaymentViewModel;
        expect(viewModel.formValues.paymentReference).toEqual(reference);
      });
    });
  });

  describe('postEditPayment', () => {
    const reportId = '12';
    const paymentId = '34';

    describe('when the form values are valid', () => {
      const getHttpMocks = () =>
        httpMocks.createMocks<PostEditPaymentRequest>({
          params: { reportId, paymentId },
          session: aRequestSession(),
          body: aPostEditPaymentRequestBody(),
        });

      beforeEach(() => {
        jest.mocked(api.editPayment).mockResolvedValue();
      });

      it('edits the payment with the supplied data', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        const user = aTfmSessionUser();
        const userToken = 'abc123';
        req.session.user = user;
        req.session.userToken = userToken;

        const paymentAmount = 100;
        req.body.paymentAmount = '100';

        const datePaymentReceived = new Date('2024-5-12');
        req.body['paymentDate-day'] = '12';
        req.body['paymentDate-month'] = '5';
        req.body['paymentDate-year'] = '2024';

        const paymentReference = 'A payment reference';
        req.body.paymentReference = paymentReference;

        const expectedParsedFormValues: ParsedEditPaymentFormValues = {
          paymentAmount,
          datePaymentReceived,
          paymentReference,
        };

        // Act
        await postEditPayment(req, res);

        // Assert
        expect(api.editPayment).toHaveBeenCalledWith(reportId, paymentId, expectedParsedFormValues, user, userToken);
      });

      it('redirects to the reconciliation for report page', async () => {
        // Arrange
        const { req, res } = getHttpMocks();
        req.query.redirectTab = RECONCILIATION_FOR_REPORT_TABS.PAYMENT_DETAILS;

        // Act
        await postEditPayment(req, res);

        // Assert
        expect(res._getRedirectUrl()).toEqual(`/utilisation-reports/${reportId}#${RECONCILIATION_FOR_REPORT_TABS.PAYMENT_DETAILS}`);
      });

      function aPostEditPaymentRequestBody(): EditPaymentFormRequestBody {
        return {
          paymentAmount: '100',
          'paymentDate-day': '12',
          'paymentDate-month': '5',
          'paymentDate-year': '2024',
          paymentReference: 'Some reference',
        };
      }
    });

    describe('when the form values are not valid', () => {
      const getHttpMocks = () =>
        httpMocks.createMocks<PostEditPaymentRequest>({
          params: { reportId, paymentId },
          session: aRequestSession(),
          body: {},
        });

      it('renders the edit payment page', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        // Act
        await postEditPayment(req, res);

        // Assert
        expect(res._getRenderView()).toEqual('utilisation-reports/edit-payment.njk');
      });

      it('sets the render view model reportId to the request params reportId', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        // Act
        await postEditPayment(req, res);

        // Assert
        const viewModel = res._getRenderData() as EditPaymentViewModel;
        expect(viewModel.reportId).toEqual(reportId);
      });

      it('sets the render view model paymentId to the request params paymentId', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        // Act
        await postEditPayment(req, res);

        // Assert
        const viewModel = res._getRenderData() as EditPaymentViewModel;
        expect(viewModel.paymentId).toEqual(paymentId);
      });

      it('sets the render view model paymentCurrency to the edit payment details response payment currency', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        const paymentCurrency: Currency = 'USD';

        jest.mocked(api.getPaymentDetailsWithFeeRecords).mockResolvedValue({
          ...aPaymentDetailsWithFeeRecordsResponseBody(),
          payment: {
            ...aPayment(),
            currency: paymentCurrency,
          },
        });

        // Act
        await postEditPayment(req, res);

        // Assert
        const viewModel = res._getRenderData() as EditPaymentViewModel;
        expect(viewModel.paymentCurrency).toEqual(paymentCurrency);
      });

      it('sets the render view model bank to the edit payment details response bank', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        const bank: SessionBank = { id: '123', name: 'Test bank' };

        jest.mocked(api.getPaymentDetailsWithFeeRecords).mockResolvedValue({
          ...aPaymentDetailsWithFeeRecordsResponseBody(),
          bank,
        });

        // Act
        await postEditPayment(req, res);

        // Assert
        const viewModel = res._getRenderData() as EditPaymentViewModel;
        expect(viewModel.bank).toEqual(bank);
      });

      it('sets the render view model formattedReportPeriod to the formatted edit payment details response report period', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        const reportPeriod: ReportPeriod = {
          start: { month: 1, year: 2024 },
          end: { month: 1, year: 2024 },
        };
        const formattedReportPeriod = 'January 2024';

        jest.mocked(api.getPaymentDetailsWithFeeRecords).mockResolvedValue({
          ...aPaymentDetailsWithFeeRecordsResponseBody(),
          reportPeriod,
        });

        // Act
        await postEditPayment(req, res);

        // Assert
        const viewModel = res._getRenderData() as EditPaymentViewModel;
        expect(viewModel.formattedReportPeriod).toEqual(formattedReportPeriod);
      });

      it('sets the render view model feeRecords id to the edit payment details response feeRecords id', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        const feeRecordIds = [1, 2];
        const feeRecords = feeRecordIds.map((id) => ({ ...aFeeRecord(), id }));

        jest.mocked(api.getPaymentDetailsWithFeeRecords).mockResolvedValue({
          ...aPaymentDetailsWithFeeRecordsResponseBody(),
          feeRecords,
        });

        // Act
        await postEditPayment(req, res);

        // Assert
        const viewModel = res._getRenderData() as EditPaymentViewModel;
        expect(viewModel.feeRecords).toHaveLength(feeRecordIds.length);
        viewModel.feeRecords.forEach(({ id }, index) => expect(id).toEqual(feeRecordIds[index]));
      });

      it('sets the render view model feeRecords facilityId to the edit payment details response feeRecords facilityId', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        const feeRecordFacilityIds = ['12345678', '87654321'];
        const feeRecords = feeRecordFacilityIds.map((facilityId) => ({ ...aFeeRecord(), facilityId }));

        jest.mocked(api.getPaymentDetailsWithFeeRecords).mockResolvedValue({
          ...aPaymentDetailsWithFeeRecordsResponseBody(),
          feeRecords,
        });

        // Act
        await postEditPayment(req, res);

        // Assert
        const viewModel = res._getRenderData() as EditPaymentViewModel;
        expect(viewModel.feeRecords).toHaveLength(feeRecordFacilityIds.length);
        viewModel.feeRecords.forEach(({ facilityId }, index) => expect(facilityId).toEqual(feeRecordFacilityIds[index]));
      });

      it('sets the render view model feeRecords exporter to the edit payment details response feeRecords exporter', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        const feeRecordExporters = ['12345678', '87654321'];
        const feeRecords = feeRecordExporters.map((exporter) => ({ ...aFeeRecord(), exporter }));

        jest.mocked(api.getPaymentDetailsWithFeeRecords).mockResolvedValue({
          ...aPaymentDetailsWithFeeRecordsResponseBody(),
          feeRecords,
        });

        // Act
        await postEditPayment(req, res);

        // Assert
        const viewModel = res._getRenderData() as EditPaymentViewModel;
        expect(viewModel.feeRecords).toHaveLength(feeRecordExporters.length);
        viewModel.feeRecords.forEach(({ exporter }, index) => expect(exporter).toEqual(feeRecordExporters[index]));
      });

      it('sets the render view model feeRecords reportedFees to the edit payment details response feeRecords sorted and formatted reportedFees', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        const feeRecordReportedFees: CurrencyAndAmount[] = [
          { currency: 'GBP', amount: 100 },
          { currency: 'EUR', amount: 50 },
        ];
        const formattedReportedFees: SortedAndFormattedCurrencyAndAmount[] = [
          { formattedCurrencyAndAmount: 'GBP 100.00', dataSortValue: 1 },
          { formattedCurrencyAndAmount: 'EUR 50.00', dataSortValue: 0 },
        ];
        const feeRecords = feeRecordReportedFees.map((reportedFees) => ({ ...aFeeRecord(), reportedFees }));

        jest.mocked(api.getPaymentDetailsWithFeeRecords).mockResolvedValue({
          ...aPaymentDetailsWithFeeRecordsResponseBody(),
          feeRecords,
        });

        // Act
        await postEditPayment(req, res);

        // Assert
        const viewModel = res._getRenderData() as EditPaymentViewModel;
        expect(viewModel.feeRecords).toHaveLength(feeRecordReportedFees.length);
        viewModel.feeRecords.forEach(({ reportedFees }, index) => expect(reportedFees).toEqual(formattedReportedFees[index]));
      });

      it('sets the render view model feeRecords reportedPayments to the edit payment details response feeRecords sorted and formatted reportedPayments', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        const feeRecordReportedPayments: CurrencyAndAmount[] = [
          { currency: 'GBP', amount: 100 },
          { currency: 'EUR', amount: 50 },
        ];
        const formattedReportedPayments: SortedAndFormattedCurrencyAndAmount[] = [
          { formattedCurrencyAndAmount: 'GBP 100.00', dataSortValue: 1 },
          { formattedCurrencyAndAmount: 'EUR 50.00', dataSortValue: 0 },
        ];
        const feeRecords = feeRecordReportedPayments.map((reportedPayments) => ({ ...aFeeRecord(), reportedPayments }));

        jest.mocked(api.getPaymentDetailsWithFeeRecords).mockResolvedValue({
          ...aPaymentDetailsWithFeeRecordsResponseBody(),
          feeRecords,
        });

        // Act
        await postEditPayment(req, res);

        // Assert
        const viewModel = res._getRenderData() as EditPaymentViewModel;
        expect(viewModel.feeRecords).toHaveLength(feeRecordReportedPayments.length);
        viewModel.feeRecords.forEach(({ reportedPayments }, index) => expect(reportedPayments).toEqual(formattedReportedPayments[index]));
      });

      it("sets the render view model feeRecords checkboxId to 'feeRecordId-' followed by the fee record id", async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        const feeRecordIds = [1, 2];
        const feeRecords = feeRecordIds.map((id) => ({ ...aFeeRecord(), id }));

        jest.mocked(api.getPaymentDetailsWithFeeRecords).mockResolvedValue({
          ...aPaymentDetailsWithFeeRecordsResponseBody(),
          feeRecords,
        });

        // Act
        await postEditPayment(req, res);

        // Assert
        const viewModel = res._getRenderData() as EditPaymentViewModel;
        expect(viewModel.feeRecords).toHaveLength(feeRecordIds.length);
        viewModel.feeRecords.forEach(({ checkboxId }, index) => expect(checkboxId).toEqual(`feeRecordId-${feeRecordIds[index]}`));
      });

      it('sets the render view model feeRecords isChecked based on whether the fee record was selected or not', async () => {
        // Arrange
        const { req, res } = getHttpMocks();
        req.body = {
          'feeRecordId-1': 'on',
          'feeRecordId-3': 'on',
        };

        const feeRecords = [
          { ...aFeeRecord(), id: 1 },
          { ...aFeeRecord(), id: 2 },
          { ...aFeeRecord(), id: 3 },
        ];

        jest.mocked(api.getPaymentDetailsWithFeeRecords).mockResolvedValue({
          ...aPaymentDetailsWithFeeRecordsResponseBody(),
          feeRecords,
        });

        // Act
        await postEditPayment(req, res);

        // Assert
        const viewModel = res._getRenderData() as EditPaymentViewModel;
        expect(viewModel.feeRecords).toHaveLength(feeRecords.length);
        expect(viewModel.feeRecords[0].isChecked).toEqual(true);
        expect(viewModel.feeRecords[1].isChecked).toEqual(false);
        expect(viewModel.feeRecords[2].isChecked).toEqual(true);
      });

      it('sets the render view model totalReportedPayments to the edit payment details response formatted totalReportedPayments', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        const totalReportedPayments: CurrencyAndAmount = { currency: 'USD', amount: 314.59 };
        jest.mocked(api.getPaymentDetailsWithFeeRecords).mockResolvedValue({
          ...aPaymentDetailsWithFeeRecordsResponseBody(),
          totalReportedPayments,
        });

        // Act
        await postEditPayment(req, res);

        // Assert
        const viewModel = res._getRenderData() as EditPaymentViewModel;
        expect(viewModel.totalReportedPayments).toEqual('USD 314.59');
      });

      it('sets the render view model formValues paymentAmount to the request body paymentAmount', async () => {
        // Arrange
        const { req, res } = getHttpMocks();
        req.body = { paymentAmount: '314.59' };

        // Act
        await postEditPayment(req, res);

        // Assert
        const viewModel = res._getRenderData() as EditPaymentViewModel;
        expect(viewModel.formValues.paymentAmount).toEqual('314.59');
      });

      it('sets the render view model formValues paymentDate day to the request body paymentDate-day', async () => {
        // Arrange
        const { req, res } = getHttpMocks();
        req.body = { 'paymentDate-day': '10' };

        // Act
        await postEditPayment(req, res);

        // Assert
        const viewModel = res._getRenderData() as EditPaymentViewModel;
        expect(viewModel.formValues.paymentDate.day).toEqual('10');
      });

      it('sets the render view model formValues paymentDate month to the request body paymentDate-month', async () => {
        // Arrange
        const { req, res } = getHttpMocks();
        req.body = { 'paymentDate-month': '5' };

        // Act
        await postEditPayment(req, res);

        // Assert
        const viewModel = res._getRenderData() as EditPaymentViewModel;
        expect(viewModel.formValues.paymentDate.month).toEqual('5');
      });

      it('sets the render view model formValues paymentDate year to the request body paymentDate-year', async () => {
        // Arrange
        const { req, res } = getHttpMocks();
        req.body = { 'paymentDate-year': '2024' };

        // Act
        await postEditPayment(req, res);

        // Assert
        const viewModel = res._getRenderData() as EditPaymentViewModel;
        expect(viewModel.formValues.paymentDate.year).toEqual('2024');
      });

      it('sets the render view model formValues paymentReference to the edit payment details response payment reference', async () => {
        // Arrange
        const { req, res } = getHttpMocks();
        req.body = { paymentReference: 'A payment reference' };

        // Act
        await postEditPayment(req, res);

        // Assert
        const viewModel = res._getRenderData() as EditPaymentViewModel;
        expect(viewModel.formValues.paymentReference).toEqual('A payment reference');
      });

      it('populates the render view model errors errorSummary array', async () => {
        // Arrange
        const { req, res } = getHttpMocks();
        req.body = {};

        // Act
        await postEditPayment(req, res);

        // Assert
        const viewModel = res._getRenderData() as EditPaymentViewModel;
        expect(viewModel.errors.errorSummary).not.toHaveLength(0);
      });
    });
  });
});
