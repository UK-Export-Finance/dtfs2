import httpMocks from 'node-mocks-http';
import { CURRENCY, SelectedFeeRecordDetails } from '@ukef/dtfs2-common';
import api from '../../../api';
import { MOCK_TFM_SESSION_USER } from '../../../test-mocks/mock-tfm-session-user';
import { AddPaymentRequestBody, addPayment } from '.';
import { AddPaymentErrorsViewModel, AddPaymentViewModel, RecordedPaymentDetailsViewModel } from '../../../types/view-models';
import * as validation from './add-payment-form-values-validator';
import { AddPaymentFormValues } from '../../../types/add-payment-form-values';
import { SelectedFeeRecordsDetailsResponseBody } from '../../../api-response-types';

jest.mock('../../../api');

console.error = jest.fn();

describe('controllers/utilisation-reports/:id/add-payment', () => {
  const userToken = 'user-token';
  const requestSession = {
    userToken,
    user: MOCK_TFM_SESSION_USER,
  };

  describe('when navigating from premium payments table', () => {
    const requestBodyForPostFromPremiumPaymentsPage: AddPaymentRequestBody = {
      'feeRecordIds-456-reportedPaymentsCurrency-GBP-status-TO_DO': 'on',
    };

    it('should render add payment page', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId: '123' },
        body: requestBodyForPostFromPremiumPaymentsPage,
      });
      jest.mocked(api.getSelectedFeeRecordsDetails).mockResolvedValue(aSelectedFeeRecordsDetails());

      // Act
      await addPayment(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-reports/add-payment.njk');
    });

    it('should fetch and map selected fee record details', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId: '123' },
        body: requestBodyForPostFromPremiumPaymentsPage,
      });
      const selectedFeeRecordDetailsResponse: SelectedFeeRecordsDetailsResponseBody = {
        bank: { name: 'Test' },
        reportPeriod: { start: { month: 2, year: 2024 }, end: { month: 4, year: 2024 } },
        totalReportedPayments: { amount: 1000, currency: 'JPY' },
        feeRecords: [
          {
            id: 456,
            facilityId: '000123',
            exporter: 'Export Company',
            reportedFee: { amount: 2000, currency: 'EUR' },
            reportedPayments: { amount: 3000, currency: 'USD' },
          },
        ],
        payments: [
          {
            dateReceived: '1912-12-19T00:00:00.000Z',
            currency: 'USD',
            amount: 2000,
            reference: 'A payment',
          },
        ],
      };
      jest.mocked(api.getSelectedFeeRecordsDetails).mockResolvedValue(selectedFeeRecordDetailsResponse);

      // Act
      await addPayment(req, res);

      // Assert
      expect(api.getSelectedFeeRecordsDetails).toHaveBeenCalledWith('123', [456], requestSession.userToken);
      expect(res._getRenderView()).toEqual('utilisation-reports/add-payment.njk');
      expect((res._getRenderData() as AddPaymentViewModel).bank).toEqual({ name: 'Test' });
      expect((res._getRenderData() as AddPaymentViewModel).formattedReportPeriod).toEqual('February to April 2024');
      expect((res._getRenderData() as AddPaymentViewModel).reportedFeeDetails).toEqual({
        totalReportedPayments: 'JPY 1,000.00',
        feeRecords: [
          {
            feeRecordId: 456,
            facilityId: '000123',
            exporter: 'Export Company',
            reportedFee: { value: 'EUR 2,000.00', dataSortValue: 0 },
            reportedPayments: { value: 'USD 3,000.00', dataSortValue: 0 },
          },
        ],
      });
      expect((res._getRenderData() as AddPaymentViewModel).recordedPaymentsDetails).toEqual<RecordedPaymentDetailsViewModel[]>([
        {
          formattedDateReceived: '19 Dec 1912',
          formattedCurrencyAndAmount: 'USD 2,000.00',
          reference: 'A payment',
        },
      ]);
    });

    it('should not display any errors', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId: '123' },
        body: requestBodyForPostFromPremiumPaymentsPage,
      });
      jest.mocked(api.getSelectedFeeRecordsDetails).mockResolvedValue(aSelectedFeeRecordsDetails());

      // Act
      await addPayment(req, res);

      // Assert
      expect((res._getRenderData() as AddPaymentViewModel).errors).toEqual({
        errorSummary: [],
      });
    });

    it('should set the report id', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId: '123' },
        body: requestBodyForPostFromPremiumPaymentsPage,
      });
      jest.mocked(api.getSelectedFeeRecordsDetails).mockResolvedValue(aSelectedFeeRecordsDetails());

      // Act
      await addPayment(req, res);

      // Assert
      expect((res._getRenderData() as AddPaymentViewModel).reportId).toEqual('123');
    });

    it('should set the selected checkbox ids', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId: '123' },
        body: {
          'feeRecordIds-456-reportedPaymentsCurrency-GBP-status-TO_DO': 'on',
        },
      });
      jest.mocked(api.getSelectedFeeRecordsDetails).mockResolvedValue(aSelectedFeeRecordsDetails());

      // Act
      await addPayment(req, res);

      // Assert
      expect((res._getRenderData() as AddPaymentViewModel).selectedFeeRecordCheckboxIds).toEqual([
        'feeRecordIds-456-reportedPaymentsCurrency-GBP-status-TO_DO',
      ]);
    });

    it('should not preset any form values', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId: '123' },
        body: requestBodyForPostFromPremiumPaymentsPage,
      });
      jest.mocked(api.getSelectedFeeRecordsDetails).mockResolvedValue(aSelectedFeeRecordsDetails());

      // Act
      await addPayment(req, res);

      // Assert
      expect((res._getRenderData() as AddPaymentViewModel).formValues).toEqual({
        paymentDate: {},
      });
    });

    it('should set payment number to undefined', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId: '123' },
        body: requestBodyForPostFromPremiumPaymentsPage,
      });
      jest.mocked(api.getSelectedFeeRecordsDetails).mockResolvedValue(aSelectedFeeRecordsDetails());

      // Act
      await addPayment(req, res);

      // Assert
      expect((res._getRenderData() as AddPaymentViewModel).paymentNumber).toEqual(undefined);
    });

    it('should set data sort values for reported fee column to order by currency alphabetically then value', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId: '123' },
        body: requestBodyForPostFromPremiumPaymentsPage,
      });
      jest.mocked(api.getSelectedFeeRecordsDetails).mockResolvedValue({
        ...aSelectedFeeRecordsDetails(),
        feeRecords: [
          {
            ...aSelectedFeeRecordDetails(),
            id: 1,
            reportedFee: { amount: 2000, currency: 'EUR' },
          },
          {
            ...aSelectedFeeRecordDetails(),
            id: 2,
            reportedFee: { amount: 3000, currency: 'EUR' },
          },
          {
            ...aSelectedFeeRecordDetails(),
            id: 3,
            reportedFee: { amount: 100, currency: 'JPY' },
          },
          {
            ...aSelectedFeeRecordDetails(),
            id: 4,
            reportedFee: { amount: 100.01, currency: 'JPY' },
          },
          {
            ...aSelectedFeeRecordDetails(),
            id: 5,
            reportedFee: { amount: 2000, currency: 'GBP' },
          },
          {
            ...aSelectedFeeRecordDetails(),
            id: 6,
            reportedFee: { amount: 10, currency: 'USD' },
          },
        ],
      });

      // Act
      await addPayment(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-reports/add-payment.njk');
      expect((res._getRenderData() as AddPaymentViewModel).reportedFeeDetails.feeRecords[0].reportedFee.dataSortValue).toEqual(0);
      expect((res._getRenderData() as AddPaymentViewModel).reportedFeeDetails.feeRecords[1].reportedFee.dataSortValue).toEqual(1);
      expect((res._getRenderData() as AddPaymentViewModel).reportedFeeDetails.feeRecords[2].reportedFee.dataSortValue).toEqual(3);
      expect((res._getRenderData() as AddPaymentViewModel).reportedFeeDetails.feeRecords[3].reportedFee.dataSortValue).toEqual(4);
      expect((res._getRenderData() as AddPaymentViewModel).reportedFeeDetails.feeRecords[4].reportedFee.dataSortValue).toEqual(2);
      expect((res._getRenderData() as AddPaymentViewModel).reportedFeeDetails.feeRecords[5].reportedFee.dataSortValue).toEqual(5);
    });

    it('should set data sort values for reported payments column to order by currency alphabetically then value', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId: '123' },
        body: requestBodyForPostFromPremiumPaymentsPage,
      });
      jest.mocked(api.getSelectedFeeRecordsDetails).mockResolvedValue({
        ...aSelectedFeeRecordsDetails(),
        feeRecords: [
          {
            ...aSelectedFeeRecordDetails(),
            id: 1,
            reportedPayments: { amount: 2000, currency: 'EUR' },
          },
          {
            ...aSelectedFeeRecordDetails(),
            id: 2,
            reportedPayments: { amount: 3000, currency: 'EUR' },
          },
          {
            ...aSelectedFeeRecordDetails(),
            id: 3,
            reportedPayments: { amount: 100, currency: 'JPY' },
          },
          {
            ...aSelectedFeeRecordDetails(),
            id: 4,
            reportedPayments: { amount: 100.01, currency: 'JPY' },
          },
          {
            ...aSelectedFeeRecordDetails(),
            id: 5,
            reportedPayments: { amount: 2000, currency: 'GBP' },
          },
          {
            ...aSelectedFeeRecordDetails(),
            id: 6,
            reportedPayments: { amount: 10, currency: 'USD' },
          },
        ],
      });

      // Act
      await addPayment(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-reports/add-payment.njk');
      expect((res._getRenderData() as AddPaymentViewModel).reportedFeeDetails.feeRecords[0].reportedPayments.dataSortValue).toEqual(0);
      expect((res._getRenderData() as AddPaymentViewModel).reportedFeeDetails.feeRecords[1].reportedPayments.dataSortValue).toEqual(1);
      expect((res._getRenderData() as AddPaymentViewModel).reportedFeeDetails.feeRecords[2].reportedPayments.dataSortValue).toEqual(3);
      expect((res._getRenderData() as AddPaymentViewModel).reportedFeeDetails.feeRecords[3].reportedPayments.dataSortValue).toEqual(4);
      expect((res._getRenderData() as AddPaymentViewModel).reportedFeeDetails.feeRecords[4].reportedPayments.dataSortValue).toEqual(2);
      expect((res._getRenderData() as AddPaymentViewModel).reportedFeeDetails.feeRecords[5].reportedPayments.dataSortValue).toEqual(5);
    });
  });

  describe('when add payment form is submitted', () => {
    describe('and the data is not valid', () => {
      const addPaymentFormSubmissionRequestBodyWithIncompleteData: AddPaymentRequestBody = {
        'feeRecordIds-456-reportedPaymentsCurrency-GBP-status-TO_DO': 'on',
        addPaymentFormSubmission: 'true',
      };

      it('should render the add payment page', async () => {
        // Arrange
        const { req, res } = httpMocks.createMocks({
          session: requestSession,
          params: { reportId: '123' },
          body: addPaymentFormSubmissionRequestBodyWithIncompleteData,
        });
        jest.mocked(api.getSelectedFeeRecordsDetails).mockResolvedValue(aSelectedFeeRecordsDetails());

        // Act
        await addPayment(req, res);

        // Assert
        expect(res._getRenderView()).toEqual('utilisation-reports/add-payment.njk');
      });

      it('should set the errors returned from the validator', async () => {
        // Arrange
        const feeRecordPaymentCurrency = CURRENCY.GBP;
        const { req, res } = httpMocks.createMocks({
          session: requestSession,
          params: { reportId: '123' },
          body: {
            'feeRecordIds-456-reportedPaymentsCurrency-GBP-status-TO_DO': 'on',
            addPaymentFormSubmission: 'true',
            paymentAmount: 'one hundred',
          },
        });
        jest.mocked(api.getSelectedFeeRecordsDetails).mockResolvedValue(aSelectedFeeRecordsDetails());
        const validationSpy = jest.spyOn(validation, 'validateAddPaymentRequestFormValues').mockReturnValue({
          errorSummary: [{ text: 'Enter a valid amount received', href: '#paymentAmount' }],
          paymentAmountErrorMessage: 'Enter a valid amount received',
        });

        // Act
        await addPayment(req, res);

        // Assert
        expect(validationSpy).toHaveBeenCalledTimes(1);
        expect(validationSpy).toHaveBeenCalledWith(
          {
            addAnotherPayment: undefined,
            paymentAmount: 'one hundred',
            paymentCurrency: undefined,
            paymentDate: {
              day: undefined,
              month: undefined,
              year: undefined,
            },
            paymentReference: undefined,
          },
          feeRecordPaymentCurrency,
        );
        expect((res._getRenderData() as AddPaymentViewModel).errors).toEqual<AddPaymentErrorsViewModel>({
          errorSummary: [{ text: 'Enter a valid amount received', href: '#paymentAmount' }],
          paymentAmountErrorMessage: 'Enter a valid amount received',
        });
      });

      it('sets form values to submitted values', async () => {
        // Arrange
        const requestBody: AddPaymentRequestBody = {
          'feeRecordIds-456-reportedPaymentsCurrency-GBP-status-TO_DO': 'on',
          addPaymentFormSubmission: 'true',
          paymentCurrency: 'JPY',
          paymentAmount: 'one hundred',
          'paymentDate-day': '12',
          'paymentDate-month': '12',
          'paymentDate-year': '2000',
          addAnotherPayment: 'false',
          paymentReference: 'Money',
        };
        const { req, res } = httpMocks.createMocks({
          session: requestSession,
          params: { reportId: '123' },
          body: requestBody,
        });
        jest.mocked(api.getSelectedFeeRecordsDetails).mockResolvedValue(aSelectedFeeRecordsDetails());

        // Act
        await addPayment(req, res);

        // Assert
        expect((res._getRenderData() as AddPaymentViewModel).formValues).toEqual<AddPaymentFormValues>({
          paymentCurrency: 'JPY',
          paymentAmount: 'one hundred',
          paymentDate: {
            day: '12',
            month: '12',
            year: '2000',
          },
          paymentReference: 'Money',
          addAnotherPayment: 'false',
        });
      });

      it('should fetch and map selected fee record details', async () => {
        // Arrange
        const { req, res } = httpMocks.createMocks({
          session: requestSession,
          params: { reportId: '123' },
          body: {
            'feeRecordIds-456-reportedPaymentsCurrency-GBP-status-TO_DO': 'on',
            addPaymentFormSubmission: 'true',
          },
        });
        jest.mocked(api.getSelectedFeeRecordsDetails).mockResolvedValue({
          bank: { name: 'Test' },
          reportPeriod: { start: { month: 2, year: 2024 }, end: { month: 4, year: 2024 } },
          totalReportedPayments: { amount: 1000, currency: 'JPY' },
          feeRecords: [
            {
              id: 456,
              facilityId: '000123',
              exporter: 'Export Company',
              reportedFee: { amount: 2000, currency: 'EUR' },
              reportedPayments: { amount: 3000, currency: 'USD' },
            },
          ],
          payments: [
            {
              dateReceived: '1912-12-19T00:00:00.000Z',
              currency: 'USD',
              amount: 2000,
              reference: 'A payment',
            },
          ],
        });

        // Act
        await addPayment(req, res);

        // Assert
        expect(api.getSelectedFeeRecordsDetails).toHaveBeenCalledWith('123', [456], requestSession.userToken);
        expect((res._getRenderData() as AddPaymentViewModel).bank).toEqual({ name: 'Test' });
        expect((res._getRenderData() as AddPaymentViewModel).formattedReportPeriod).toEqual('February to April 2024');
        expect((res._getRenderData() as AddPaymentViewModel).reportedFeeDetails).toEqual({
          totalReportedPayments: 'JPY 1,000.00',
          feeRecords: [
            {
              feeRecordId: 456,
              facilityId: '000123',
              exporter: 'Export Company',
              reportedFee: { value: 'EUR 2,000.00', dataSortValue: 0 },
              reportedPayments: { value: 'USD 3,000.00', dataSortValue: 0 },
            },
          ],
        });
        expect((res._getRenderData() as AddPaymentViewModel).recordedPaymentsDetails).toEqual<RecordedPaymentDetailsViewModel[]>([
          {
            formattedDateReceived: '19 Dec 1912',
            formattedCurrencyAndAmount: 'USD 2,000.00',
            reference: 'A payment',
          },
        ]);
      });

      it('should set selected checkbox ids', async () => {
        // Arrange
        const { req, res } = httpMocks.createMocks({
          session: requestSession,
          params: { reportId: '123' },
          body: {
            'feeRecordIds-456-reportedPaymentsCurrency-GBP-status-TO_DO': 'on',
            addPaymentFormSubmission: 'true',
          },
        });
        jest.mocked(api.getSelectedFeeRecordsDetails).mockResolvedValue(aSelectedFeeRecordsDetails());

        // Act
        await addPayment(req, res);

        // Assert
        expect((res._getRenderData() as AddPaymentViewModel).selectedFeeRecordCheckboxIds).toEqual([
          'feeRecordIds-456-reportedPaymentsCurrency-GBP-status-TO_DO',
        ]);
      });

      it('should set report id', async () => {
        // Arrange
        const { req, res } = httpMocks.createMocks({
          session: requestSession,
          params: { reportId: '123' },
          body: addPaymentFormSubmissionRequestBodyWithIncompleteData,
        });
        jest.mocked(api.getSelectedFeeRecordsDetails).mockResolvedValue(aSelectedFeeRecordsDetails());

        // Act
        await addPayment(req, res);

        // Assert
        expect((res._getRenderData() as AddPaymentViewModel).reportId).toEqual('123');
      });

      it('should set data sort values for reported fee column to order by currency alphabetically then value', async () => {
        // Arrange
        const { req, res } = httpMocks.createMocks({
          session: requestSession,
          params: { reportId: '123' },
          body: addPaymentFormSubmissionRequestBodyWithIncompleteData,
        });
        jest.mocked(api.getSelectedFeeRecordsDetails).mockResolvedValue({
          ...aSelectedFeeRecordsDetails(),
          feeRecords: [
            {
              ...aSelectedFeeRecordDetails(),
              id: 1,
              reportedFee: { amount: 2000, currency: 'EUR' },
            },
            {
              ...aSelectedFeeRecordDetails(),
              id: 2,
              reportedFee: { amount: 3000, currency: 'EUR' },
            },
            {
              ...aSelectedFeeRecordDetails(),
              id: 3,
              reportedFee: { amount: 100, currency: 'JPY' },
            },
            {
              ...aSelectedFeeRecordDetails(),
              id: 4,
              reportedFee: { amount: 100.01, currency: 'JPY' },
            },
            {
              ...aSelectedFeeRecordDetails(),
              id: 5,
              reportedFee: { amount: 2000, currency: 'GBP' },
            },
            {
              ...aSelectedFeeRecordDetails(),
              id: 6,
              reportedFee: { amount: 10, currency: 'USD' },
            },
          ],
        });

        // Act
        await addPayment(req, res);

        // Assert
        expect(res._getRenderView()).toEqual('utilisation-reports/add-payment.njk');
        expect((res._getRenderData() as AddPaymentViewModel).reportedFeeDetails.feeRecords[0].reportedFee.dataSortValue).toEqual(0);
        expect((res._getRenderData() as AddPaymentViewModel).reportedFeeDetails.feeRecords[1].reportedFee.dataSortValue).toEqual(1);
        expect((res._getRenderData() as AddPaymentViewModel).reportedFeeDetails.feeRecords[2].reportedFee.dataSortValue).toEqual(3);
        expect((res._getRenderData() as AddPaymentViewModel).reportedFeeDetails.feeRecords[3].reportedFee.dataSortValue).toEqual(4);
        expect((res._getRenderData() as AddPaymentViewModel).reportedFeeDetails.feeRecords[4].reportedFee.dataSortValue).toEqual(2);
        expect((res._getRenderData() as AddPaymentViewModel).reportedFeeDetails.feeRecords[5].reportedFee.dataSortValue).toEqual(5);
      });

      it('should set data sort values for reported payments column to order by currency alphabetically then value', async () => {
        // Arrange
        const { req, res } = httpMocks.createMocks({
          session: requestSession,
          params: { reportId: '123' },
          body: addPaymentFormSubmissionRequestBodyWithIncompleteData,
        });
        jest.mocked(api.getSelectedFeeRecordsDetails).mockResolvedValue({
          ...aSelectedFeeRecordsDetails(),
          feeRecords: [
            {
              ...aSelectedFeeRecordDetails(),
              id: 1,
              reportedPayments: { amount: 2000, currency: 'EUR' },
            },
            {
              ...aSelectedFeeRecordDetails(),
              id: 2,
              reportedPayments: { amount: 3000, currency: 'EUR' },
            },
            {
              ...aSelectedFeeRecordDetails(),
              id: 3,
              reportedPayments: { amount: 100, currency: 'JPY' },
            },
            {
              ...aSelectedFeeRecordDetails(),
              id: 4,
              reportedPayments: { amount: 100.01, currency: 'JPY' },
            },
            {
              ...aSelectedFeeRecordDetails(),
              id: 5,
              reportedPayments: { amount: 2000, currency: 'GBP' },
            },
            {
              ...aSelectedFeeRecordDetails(),
              id: 6,
              reportedPayments: { amount: 10, currency: 'USD' },
            },
          ],
        });

        // Act
        await addPayment(req, res);

        // Assert
        expect(res._getRenderView()).toEqual('utilisation-reports/add-payment.njk');
        expect((res._getRenderData() as AddPaymentViewModel).reportedFeeDetails.feeRecords[0].reportedPayments.dataSortValue).toEqual(0);
        expect((res._getRenderData() as AddPaymentViewModel).reportedFeeDetails.feeRecords[1].reportedPayments.dataSortValue).toEqual(1);
        expect((res._getRenderData() as AddPaymentViewModel).reportedFeeDetails.feeRecords[2].reportedPayments.dataSortValue).toEqual(3);
        expect((res._getRenderData() as AddPaymentViewModel).reportedFeeDetails.feeRecords[3].reportedPayments.dataSortValue).toEqual(4);
        expect((res._getRenderData() as AddPaymentViewModel).reportedFeeDetails.feeRecords[4].reportedPayments.dataSortValue).toEqual(2);
        expect((res._getRenderData() as AddPaymentViewModel).reportedFeeDetails.feeRecords[5].reportedPayments.dataSortValue).toEqual(5);
      });
    });

    describe('and the data is valid', () => {
      const feeRecordIds = [123];

      const addPaymentFormSubmissionRequestBody: AddPaymentRequestBody = {
        'feeRecordIds-123-reportedPaymentsCurrency-GBP-status-TO_DO': 'on',
        addPaymentFormSubmission: 'true',
        paymentCurrency: CURRENCY.GBP,
        paymentAmount: '100',
        'paymentDate-day': '1',
        'paymentDate-month': '5',
        'paymentDate-year': '2024',
        paymentReference: 'A payment reference',
        addAnotherPayment: 'true',
      };

      const addPaymentToFeeRecordsSpy = jest.spyOn(api, 'addPaymentToFeeRecords');

      const reportId = '123';

      beforeAll(() => {
        jest.restoreAllMocks();
      });

      beforeEach(() => {
        jest.mocked(api.getSelectedFeeRecordsDetails).mockResolvedValue(aSelectedFeeRecordsDetails());
        addPaymentToFeeRecordsSpy.mockResolvedValue({});
      });

      afterEach(() => {
        jest.resetAllMocks();
      });

      it('adds the payment to the selected fee records', async () => {
        // Arrange
        const { req, res } = httpMocks.createMocks({
          session: requestSession,
          params: { reportId },
          body: addPaymentFormSubmissionRequestBody,
        });

        // Act
        await addPayment(req, res);

        // Assert
        expect(addPaymentToFeeRecordsSpy).toHaveBeenCalledWith(
          reportId,
          {
            paymentCurrency: CURRENCY.GBP,
            paymentAmount: 100,
            datePaymentReceived: new Date('2024-5-1'),
            paymentReference: 'A payment reference',
          },
          feeRecordIds,
          requestSession.user,
          requestSession.userToken,
        );
      });

      it("redirects to premium payments if 'addAnotherPayment' is set to 'false'", async () => {
        // Arrange
        const { req, res } = httpMocks.createMocks({
          session: requestSession,
          params: { reportId },
          body: {
            ...addPaymentFormSubmissionRequestBody,
            addAnotherPayment: 'false',
          },
        });

        // Act
        await addPayment(req, res);

        // Assert
        expect(res._getRedirectUrl()).toBe(`/utilisation-reports/${reportId}`);
      });

      it("should render the add payment page if 'addAnotherPayment' is set to 'true'", async () => {
        // Arrange
        const { req, res } = httpMocks.createMocks({
          session: requestSession,
          params: { reportId: '123' },
          body: {
            ...addPaymentFormSubmissionRequestBody,
            addAnotherPayment: 'true',
          },
        });
        jest.mocked(api.getSelectedFeeRecordsDetails).mockResolvedValue(aSelectedFeeRecordsDetails());

        // Act
        await addPayment(req, res);

        // Assert
        expect(res._getRenderView()).toEqual('utilisation-reports/add-payment.njk');
      });

      it("should render the add payment page with empty form values if 'addAnotherPayment' is set to 'true'", async () => {
        // Arrange
        const { req, res } = httpMocks.createMocks({
          session: requestSession,
          params: { reportId: '123' },
          body: {
            ...addPaymentFormSubmissionRequestBody,
            addAnotherPayment: 'true',
          },
        });
        jest.mocked(api.getSelectedFeeRecordsDetails).mockResolvedValue(aSelectedFeeRecordsDetails());

        // Act
        await addPayment(req, res);

        // Assert
        expect((res._getRenderData() as AddPaymentViewModel).formValues).toEqual({ paymentDate: {} });
      });

      it("should render the add payment page with empty errors if 'addAnotherPayment' is set to 'true'", async () => {
        // Arrange
        const { req, res } = httpMocks.createMocks({
          session: requestSession,
          params: { reportId: '123' },
          body: {
            ...addPaymentFormSubmissionRequestBody,
            addAnotherPayment: 'true',
          },
        });
        jest.mocked(api.getSelectedFeeRecordsDetails).mockResolvedValue(aSelectedFeeRecordsDetails());

        // Act
        await addPayment(req, res);

        // Assert
        expect((res._getRenderData() as AddPaymentViewModel).errors).toEqual({ errorSummary: [] });
      });
    });
  });

  function aSelectedFeeRecordsDetails(): SelectedFeeRecordsDetailsResponseBody {
    return {
      bank: { name: 'Test' },
      reportPeriod: { start: { month: 2, year: 2024 }, end: { month: 4, year: 2024 } },
      totalReportedPayments: { amount: 1000, currency: 'JPY' },
      feeRecords: [
        {
          id: 456,
          facilityId: '000123',
          exporter: 'Export Company',
          reportedFee: { amount: 2000, currency: 'EUR' },
          reportedPayments: { amount: 3000, currency: 'USD' },
        },
      ],
      payments: [],
    };
  }

  function aSelectedFeeRecordDetails(): SelectedFeeRecordDetails {
    return {
      id: 456,
      facilityId: '000123',
      exporter: 'Export Company',
      reportedFee: { amount: 2000, currency: 'EUR' },
      reportedPayments: { amount: 3000, currency: 'USD' },
    };
  }
});
