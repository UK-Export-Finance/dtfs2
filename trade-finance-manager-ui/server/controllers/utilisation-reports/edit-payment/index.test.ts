import httpMocks from 'node-mocks-http';
import { Currency, CurrencyAndAmount, ReportPeriod, SessionBank } from '@ukef/dtfs2-common';
import { PostEditPaymentRequest, getEditPayment, postEditPayment } from '.';
import api from '../../../api';
import { aPaymentDetailsWithFeeRecordsResponseBody, aTfmSessionUser, aPayment, aFeeRecord } from '../../../../test-helpers';
import { EMPTY_PAYMENT_ERRORS_VIEW_MODEL, EditPaymentFormRequestBody } from '../helpers';
import { EditPaymentViewModel } from '../../../types/view-models/edit-payment-view-model';
import { SortedAndFormattedCurrencyAndAmount } from '../../../types/view-models';

jest.mock('../../../api');

describe('controllers/utilisation-reports/edit-payment', () => {
  const userToken = 'abc123';
  const aRequestSession = () => ({
    user: aTfmSessionUser(),
    userToken,
  });

  beforeEach(() => {
    jest.mocked(api.getPaymentDetailsWithFeeRecords).mockResolvedValue(aPaymentDetailsWithFeeRecordsResponseBody());
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getEditPayment', () => {
    const reportId = '12';
    const paymentId = '34';

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
      expect(res._getRenderView()).toBe('utilisation-reports/edit-payment.njk');
    });

    it('sets the render view model reportId to the request params reportId', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await getEditPayment(req, res);

      // Assert
      const viewModel = res._getRenderData() as EditPaymentViewModel;
      expect(viewModel.reportId).toBe(reportId);
    });

    it('sets the render view model paymentId to the request params paymentId', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await getEditPayment(req, res);

      // Assert
      const viewModel = res._getRenderData() as EditPaymentViewModel;
      expect(viewModel.paymentId).toBe(paymentId);
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
      expect(viewModel.paymentCurrency).toBe(paymentCurrency);
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
      viewModel.feeRecords.forEach(({ id }, index) => expect(id).toBe(feeRecordIds[index]));
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
      viewModel.feeRecords.forEach(({ facilityId }, index) => expect(facilityId).toBe(feeRecordFacilityIds[index]));
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
      viewModel.feeRecords.forEach(({ exporter }, index) => expect(exporter).toBe(feeRecordExporters[index]));
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
      viewModel.feeRecords.forEach(({ checkboxId }, index) => expect(checkboxId).toBe(`feeRecordId-${feeRecordIds[index]}`));
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
      viewModel.feeRecords.forEach(({ isChecked }) => expect(isChecked).toBe(false));
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
      expect(viewModel.totalReportedPayments).toBe('USD 314.59');
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
      expect(viewModel.formValues.paymentAmount).toBe(paymentAmount.toString());
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
      expect(viewModel.formValues.paymentDate.day).toBe(day);
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
      expect(viewModel.formValues.paymentDate.month).toBe(month);
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
      expect(viewModel.formValues.paymentDate.year).toBe(year);
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
      expect(viewModel.formValues.paymentReference).toBe(reference);
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

      it('redirects to /utilisation-reports/:reportId when the edit payments form is valid', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        // Act
        await postEditPayment(req, res);

        // Assert
        expect(res._getRedirectUrl()).toBe(`/utilisation-reports/${reportId}`);
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
        expect(res._getRenderView()).toBe('utilisation-reports/edit-payment.njk');
      });

      it('sets the render view model reportId to the request params reportId', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        // Act
        await postEditPayment(req, res);

        // Assert
        const viewModel = res._getRenderData() as EditPaymentViewModel;
        expect(viewModel.reportId).toBe(reportId);
      });

      it('sets the render view model paymentId to the request params paymentId', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        // Act
        await postEditPayment(req, res);

        // Assert
        const viewModel = res._getRenderData() as EditPaymentViewModel;
        expect(viewModel.paymentId).toBe(paymentId);
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
        expect(viewModel.paymentCurrency).toBe(paymentCurrency);
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
        viewModel.feeRecords.forEach(({ id }, index) => expect(id).toBe(feeRecordIds[index]));
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
        viewModel.feeRecords.forEach(({ facilityId }, index) => expect(facilityId).toBe(feeRecordFacilityIds[index]));
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
        viewModel.feeRecords.forEach(({ exporter }, index) => expect(exporter).toBe(feeRecordExporters[index]));
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
        viewModel.feeRecords.forEach(({ checkboxId }, index) => expect(checkboxId).toBe(`feeRecordId-${feeRecordIds[index]}`));
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
        await postEditPayment(req, res);

        // Assert
        const viewModel = res._getRenderData() as EditPaymentViewModel;
        expect(viewModel.feeRecords).toHaveLength(feeRecords.length);
        viewModel.feeRecords.forEach(({ isChecked }) => expect(isChecked).toBe(false));
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
        expect(viewModel.totalReportedPayments).toBe('USD 314.59');
      });

      it('sets the render view model formValues paymentAmount to the request body paymentAmount', async () => {
        // Arrange
        const { req, res } = getHttpMocks();
        req.body = { paymentAmount: '314.59' };

        // Act
        await postEditPayment(req, res);

        // Assert
        const viewModel = res._getRenderData() as EditPaymentViewModel;
        expect(viewModel.formValues.paymentAmount).toBe('314.59');
      });

      it('sets the render view model formValues paymentDate day to the request body paymentDate-day', async () => {
        // Arrange
        const { req, res } = getHttpMocks();
        req.body = { 'paymentDate-day': '10' };

        // Act
        await postEditPayment(req, res);

        // Assert
        const viewModel = res._getRenderData() as EditPaymentViewModel;
        expect(viewModel.formValues.paymentDate.day).toBe('10');
      });

      it('sets the render view model formValues paymentDate month to the request body paymentDate-month', async () => {
        // Arrange
        const { req, res } = getHttpMocks();
        req.body = { 'paymentDate-month': '5' };

        // Act
        await postEditPayment(req, res);

        // Assert
        const viewModel = res._getRenderData() as EditPaymentViewModel;
        expect(viewModel.formValues.paymentDate.month).toBe('5');
      });

      it('sets the render view model formValues paymentDate year to the request body paymentDate-year', async () => {
        // Arrange
        const { req, res } = getHttpMocks();
        req.body = { 'paymentDate-year': '2024' };

        // Act
        await postEditPayment(req, res);

        // Assert
        const viewModel = res._getRenderData() as EditPaymentViewModel;
        expect(viewModel.formValues.paymentDate.year).toBe('2024');
      });

      it('sets the render view model formValues paymentReference to the edit payment details response payment reference', async () => {
        // Arrange
        const { req, res } = getHttpMocks();
        req.body = { paymentReference: 'A payment reference' };

        // Act
        await postEditPayment(req, res);

        // Assert
        const viewModel = res._getRenderData() as EditPaymentViewModel;
        expect(viewModel.formValues.paymentReference).toBe('A payment reference');
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
