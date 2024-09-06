import { when } from 'jest-when';
import { Currency, CurrencyAndAmount } from '@ukef/dtfs2-common';
import { getEditPaymentViewModel, getEditPaymentViewModelWithFormValues } from './edit-payment-helper';
import { aPaymentDetailsWithFeeRecordsResponseBody, aPayment, aFeeRecord } from '../../../../test-helpers';
import { GetPaymentDetailsWithFeeRecordsResponseBody } from '../../../api-response-types';
import { RECONCILIATION_FOR_REPORT_TABS } from '../../../constants/reconciliation-for-report-tabs';
import { PaymentErrorsViewModel, SortedAndFormattedCurrencyAndAmount } from '../../../types/view-models';
import { EditPaymentFormValues } from '../../../types/edit-payment-form-values';
import { EMPTY_PAYMENT_ERRORS_VIEW_MODEL } from './payment-form-helpers';
import { getReconciliationForReportHref } from './get-reconciliation-for-report-href';

jest.mock('./get-reconciliation-for-report-href');

describe('edit-payment-helper', () => {
  beforeEach(() => {
    jest.mocked(getReconciliationForReportHref).mockReturnValue('/utilisation-reports/1');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getEditPaymentViewModel', () => {
    const reportId = '12';
    const paymentId = '34';
    const isCheckboxChecked = () => false;

    it('sets the view model reportId the supplied reportId', () => {
      // Arrange
      const editPaymentResponseBody = aPaymentDetailsWithFeeRecordsResponseBody();

      // Act
      const viewModel = getEditPaymentViewModel(editPaymentResponseBody, reportId, paymentId, isCheckboxChecked);

      // Assert
      expect(viewModel.reportId).toBe(reportId);
    });

    it('sets the view model paymentId the supplied paymentId', () => {
      // Arrange
      const editPaymentResponseBody = aPaymentDetailsWithFeeRecordsResponseBody();

      // Act
      const viewModel = getEditPaymentViewModel(editPaymentResponseBody, reportId, paymentId, isCheckboxChecked);

      // Assert
      expect(viewModel.paymentId).toBe(paymentId);
    });

    it('sets the view model paymentCurrency to the edit payment response payment currency', () => {
      // Arrange
      const editPaymentResponseBody: GetPaymentDetailsWithFeeRecordsResponseBody = {
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        payment: {
          ...aPayment(),
          currency: 'USD',
        },
      };

      // Act
      const viewModel = getEditPaymentViewModel(editPaymentResponseBody, reportId, paymentId, isCheckboxChecked);

      // Assert
      expect(viewModel.paymentCurrency).toBe('USD');
    });

    it('sets the view model bank to the edit payment response bank', () => {
      // Arrange
      const editPaymentResponseBody: GetPaymentDetailsWithFeeRecordsResponseBody = {
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        bank: {
          id: '123',
          name: 'Test bank',
        },
      };

      // Act
      const viewModel = getEditPaymentViewModel(editPaymentResponseBody, reportId, paymentId, isCheckboxChecked);

      // Assert
      expect(viewModel.bank).toEqual({ id: '123', name: 'Test bank' });
    });

    it('sets the view model formattedReportPeriod to the formatted edit payment response reportPeriod', () => {
      // Arrange
      const editPaymentResponseBody: GetPaymentDetailsWithFeeRecordsResponseBody = {
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        reportPeriod: {
          start: { month: 1, year: 2024 },
          end: { month: 1, year: 2024 },
        },
      };

      // Act
      const viewModel = getEditPaymentViewModel(editPaymentResponseBody, reportId, paymentId, isCheckboxChecked);

      // Assert
      expect(viewModel.formattedReportPeriod).toBe('January 2024');
    });

    it('sets the view model paymentCurrency to the edit payment details response payment currency', () => {
      // Arrange
      const paymentCurrency: Currency = 'USD';

      const editPaymentResponseBody: GetPaymentDetailsWithFeeRecordsResponseBody = {
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        payment: {
          ...aPayment(),
          currency: paymentCurrency,
        },
      };

      // Act
      const viewModel = getEditPaymentViewModel(editPaymentResponseBody, reportId, paymentId, isCheckboxChecked);

      // Assert
      expect(viewModel.paymentCurrency).toBe(paymentCurrency);
    });

    it('sets the render view model feeRecords id to the edit payment details response feeRecords id', () => {
      // Arrange
      const feeRecordIds = [1, 2];
      const feeRecords = feeRecordIds.map((id) => ({ ...aFeeRecord(), id }));

      const editPaymentResponseBody: GetPaymentDetailsWithFeeRecordsResponseBody = {
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        feeRecords,
      };

      // Act
      const viewModel = getEditPaymentViewModel(editPaymentResponseBody, reportId, paymentId, isCheckboxChecked);

      // Assert
      expect(viewModel.feeRecords).toHaveLength(feeRecordIds.length);
      viewModel.feeRecords.forEach(({ id }, index) => expect(id).toBe(feeRecordIds[index]));
    });

    it('sets the render view model feeRecords facilityId to the edit payment details response feeRecords facilityId', () => {
      // Arrange
      const feeRecordFacilityIds = ['12345678', '87654321'];
      const feeRecords = feeRecordFacilityIds.map((facilityId) => ({ ...aFeeRecord(), facilityId }));

      const editPaymentResponseBody: GetPaymentDetailsWithFeeRecordsResponseBody = {
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        feeRecords,
      };

      // Act
      const viewModel = getEditPaymentViewModel(editPaymentResponseBody, reportId, paymentId, isCheckboxChecked);

      // Assert
      expect(viewModel.feeRecords).toHaveLength(feeRecordFacilityIds.length);
      viewModel.feeRecords.forEach(({ facilityId }, index) => expect(facilityId).toBe(feeRecordFacilityIds[index]));
    });

    it('sets the render view model feeRecords exporter to the edit payment details response feeRecords exporter', () => {
      // Arrange
      const feeRecordExporters = ['12345678', '87654321'];
      const feeRecords = feeRecordExporters.map((exporter) => ({ ...aFeeRecord(), exporter }));

      const editPaymentResponseBody: GetPaymentDetailsWithFeeRecordsResponseBody = {
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        feeRecords,
      };

      // Act
      const viewModel = getEditPaymentViewModel(editPaymentResponseBody, reportId, paymentId, isCheckboxChecked);

      // Assert
      expect(viewModel.feeRecords).toHaveLength(feeRecordExporters.length);
      viewModel.feeRecords.forEach(({ exporter }, index) => expect(exporter).toBe(feeRecordExporters[index]));
    });

    it('sets the render view model feeRecords reportedFees to the edit payment details response feeRecords sorted and formatted reportedFees', () => {
      // Arrange
      const feeRecordReportedFees: CurrencyAndAmount[] = [
        { currency: 'GBP', amount: 100 },
        { currency: 'EUR', amount: 50 },
      ];
      const formattedReportedFees: SortedAndFormattedCurrencyAndAmount[] = [
        { formattedCurrencyAndAmount: 'GBP 100.00', dataSortValue: 1 },
        { formattedCurrencyAndAmount: 'EUR 50.00', dataSortValue: 0 },
      ];
      const feeRecords = feeRecordReportedFees.map((reportedFees) => ({ ...aFeeRecord(), reportedFees }));

      const editPaymentResponseBody: GetPaymentDetailsWithFeeRecordsResponseBody = {
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        feeRecords,
      };

      // Act
      const viewModel = getEditPaymentViewModel(editPaymentResponseBody, reportId, paymentId, isCheckboxChecked);

      // Assert
      expect(viewModel.feeRecords).toHaveLength(feeRecordReportedFees.length);
      viewModel.feeRecords.forEach(({ reportedFees }, index) => expect(reportedFees).toEqual(formattedReportedFees[index]));
    });

    it('sets the render view model feeRecords reportedPayments to the edit payment details response feeRecords sorted and formatted reportedPayments', () => {
      // Arrange
      const feeRecordReportedPayments: CurrencyAndAmount[] = [
        { currency: 'GBP', amount: 100 },
        { currency: 'EUR', amount: 50 },
      ];
      const formattedReportedPayments: SortedAndFormattedCurrencyAndAmount[] = [
        { formattedCurrencyAndAmount: 'GBP 100.00', dataSortValue: 1 },
        { formattedCurrencyAndAmount: 'EUR 50.00', dataSortValue: 0 },
      ];
      const feeRecords = feeRecordReportedPayments.map((reportedPayments) => ({ ...aFeeRecord(), reportedPayments }));

      const editPaymentResponseBody: GetPaymentDetailsWithFeeRecordsResponseBody = {
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        feeRecords,
      };

      // Act
      const viewModel = getEditPaymentViewModel(editPaymentResponseBody, reportId, paymentId, isCheckboxChecked);

      // Assert
      expect(viewModel.feeRecords).toHaveLength(feeRecordReportedPayments.length);
      viewModel.feeRecords.forEach(({ reportedPayments }, index) => expect(reportedPayments).toEqual(formattedReportedPayments[index]));
    });

    it("sets the render view model feeRecords checkboxId to 'feeRecordId-' followed by the fee record id", () => {
      // Arrange
      const feeRecordIds = [1, 2];
      const feeRecords = feeRecordIds.map((id) => ({ ...aFeeRecord(), id }));

      const editPaymentResponseBody: GetPaymentDetailsWithFeeRecordsResponseBody = {
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        feeRecords,
      };

      // Act
      const viewModel = getEditPaymentViewModel(editPaymentResponseBody, reportId, paymentId, isCheckboxChecked);

      // Assert
      expect(viewModel.feeRecords).toHaveLength(feeRecordIds.length);
      viewModel.feeRecords.forEach(({ checkboxId }, index) => expect(checkboxId).toBe(`feeRecordId-${feeRecordIds[index]}`));
    });

    it('sets the render view model feeRecords isChecked value using the provided isCheckboxChecked function for every fee record', () => {
      // Arrange
      const feeRecords = [
        { ...aFeeRecord(), id: 1 },
        { ...aFeeRecord(), id: 2 },
      ];

      const mockIsCheckboxChecked = jest.fn();
      when(mockIsCheckboxChecked).calledWith('feeRecordId-1').mockReturnValue(true).calledWith('feeRecordId-2').mockReturnValue(false);

      const editPaymentResponseBody: GetPaymentDetailsWithFeeRecordsResponseBody = {
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        feeRecords,
      };

      // Act
      const viewModel = getEditPaymentViewModel(editPaymentResponseBody, reportId, paymentId, mockIsCheckboxChecked);

      // Assert
      expect(viewModel.feeRecords).toHaveLength(feeRecords.length);
      expect(mockIsCheckboxChecked).toHaveBeenCalledTimes(feeRecords.length);
      expect(viewModel.feeRecords[0].isChecked).toBe(true);
      expect(viewModel.feeRecords[1].isChecked).toBe(false);
    });

    it('sets the render view model totalReportedPayments to the edit payment details response formatted totalReportedPayments', () => {
      // Arrange
      const totalReportedPayments: CurrencyAndAmount = { currency: 'USD', amount: 314.59 };
      const editPaymentResponseBody: GetPaymentDetailsWithFeeRecordsResponseBody = {
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        totalReportedPayments,
      };

      // Act
      const viewModel = getEditPaymentViewModel(editPaymentResponseBody, reportId, paymentId, isCheckboxChecked);

      // Assert
      expect(viewModel.totalReportedPayments).toBe('USD 314.59');
    });

    it('sets the render view model errors to the empty errors', () => {
      // Act
      const viewModel = getEditPaymentViewModel(aPaymentDetailsWithFeeRecordsResponseBody(), reportId, paymentId, isCheckboxChecked);

      // Assert
      expect(viewModel.errors).toEqual(EMPTY_PAYMENT_ERRORS_VIEW_MODEL);
    });

    it('sets the render view model formValues paymentAmount to the edit payment details response payment amount', () => {
      // Arrange
      const paymentAmount = 100;
      const editPaymentResponseBody: GetPaymentDetailsWithFeeRecordsResponseBody = {
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        payment: {
          ...aPayment(),
          amount: paymentAmount,
        },
      };

      // Act
      const viewModel = getEditPaymentViewModel(editPaymentResponseBody, reportId, paymentId, isCheckboxChecked);

      // Assert
      expect(viewModel.formValues.paymentAmount).toBe(paymentAmount.toString());
    });

    it('sets the render view model formValues paymentDate day to the edit payment details response payment dateReceived day', () => {
      // Arrange
      const day = '10';
      const dateReceived = new Date(`2024-05-${day}`).toISOString();
      const editPaymentResponseBody: GetPaymentDetailsWithFeeRecordsResponseBody = {
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        payment: {
          ...aPayment(),
          dateReceived,
        },
      };

      // Act
      const viewModel = getEditPaymentViewModel(editPaymentResponseBody, reportId, paymentId, isCheckboxChecked);

      // Assert
      expect(viewModel.formValues.paymentDate.day).toBe(day);
    });

    it('sets the render view model formValues paymentDate month to the edit payment details response payment dateReceived month', () => {
      // Arrange
      const month = '5';
      const dateReceived = new Date(`2024-${month}-1`).toISOString();
      const editPaymentResponseBody: GetPaymentDetailsWithFeeRecordsResponseBody = {
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        payment: {
          ...aPayment(),
          dateReceived,
        },
      };

      // Act
      const viewModel = getEditPaymentViewModel(editPaymentResponseBody, reportId, paymentId, isCheckboxChecked);

      // Assert
      expect(viewModel.formValues.paymentDate.month).toBe(month);
    });

    it('sets the render view model formValues paymentDate year to the edit payment details response payment dateReceived year', () => {
      // Arrange
      const year = '2024';
      const dateReceived = new Date(`${year}-5-1`).toISOString();
      const editPaymentResponseBody: GetPaymentDetailsWithFeeRecordsResponseBody = {
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        payment: {
          ...aPayment(),
          dateReceived,
        },
      };

      // Act
      const viewModel = getEditPaymentViewModel(editPaymentResponseBody, reportId, paymentId, isCheckboxChecked);

      // Assert
      expect(viewModel.formValues.paymentDate.year).toBe(year);
    });

    it('sets the render view model formValues paymentReference to the edit payment details response payment reference', () => {
      // Arrange
      const reference = 'A payment reference';
      const editPaymentResponseBody: GetPaymentDetailsWithFeeRecordsResponseBody = {
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        payment: {
          ...aPayment(),
          reference,
        },
      };

      // Act
      const viewModel = getEditPaymentViewModel(editPaymentResponseBody, reportId, paymentId, isCheckboxChecked);

      // Assert
      expect(viewModel.formValues.paymentReference).toBe(reference);
    });

    it('sets the view model redirectTab to the supplied redirectTab', () => {
      // Arrange
      const redirectTab = RECONCILIATION_FOR_REPORT_TABS.KEYING_SHEET;

      // Act
      const viewModel = getEditPaymentViewModel(aPaymentDetailsWithFeeRecordsResponseBody(), reportId, paymentId, isCheckboxChecked, undefined, redirectTab);

      // Assert
      expect(viewModel.redirectTab).toEqual(redirectTab);
    });

    it('sets the back link to the reconciliation for report href using the supplied redirectTab', () => {
      // Arrange
      const redirectTab = RECONCILIATION_FOR_REPORT_TABS.KEYING_SHEET;

      jest.mocked(getReconciliationForReportHref).mockReturnValue('/utilisation-reports/123#keying-sheet');

      // Act
      const viewModel = getEditPaymentViewModel(aPaymentDetailsWithFeeRecordsResponseBody(), reportId, paymentId, isCheckboxChecked, undefined, redirectTab);

      // Assert
      expect(viewModel.backLinkHref).toEqual('/utilisation-reports/123#keying-sheet');
      expect(getReconciliationForReportHref).toHaveBeenCalledWith(reportId, redirectTab);
    });
  });

  describe('getEditPaymentViewModelWithFormValues', () => {
    const reportId = '12';
    const paymentId = '34';
    const isCheckboxChecked = () => false;

    it('sets the view model reportId the supplied reportId', () => {
      // Arrange
      const editPaymentResponseBody = aPaymentDetailsWithFeeRecordsResponseBody();

      // Act
      const viewModel = getEditPaymentViewModelWithFormValues(
        editPaymentResponseBody,
        reportId,
        paymentId,
        isCheckboxChecked,
        aValidEditPaymentFormValuesObject(),
        aPaymentErrorsViewModel(),
      );

      // Assert
      expect(viewModel.reportId).toBe(reportId);
    });

    it('sets the view model paymentId the supplied paymentId', () => {
      // Arrange
      const editPaymentResponseBody = aPaymentDetailsWithFeeRecordsResponseBody();

      // Act
      const viewModel = getEditPaymentViewModelWithFormValues(
        editPaymentResponseBody,
        reportId,
        paymentId,
        isCheckboxChecked,
        aValidEditPaymentFormValuesObject(),
        aPaymentErrorsViewModel(),
      );

      // Assert
      expect(viewModel.paymentId).toBe(paymentId);
    });

    it('sets the view model paymentCurrency to the edit payment response payment currency', () => {
      // Arrange
      const editPaymentResponseBody: GetPaymentDetailsWithFeeRecordsResponseBody = {
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        payment: {
          ...aPayment(),
          currency: 'USD',
        },
      };

      // Act
      const viewModel = getEditPaymentViewModelWithFormValues(
        editPaymentResponseBody,
        reportId,
        paymentId,
        isCheckboxChecked,
        aValidEditPaymentFormValuesObject(),
        aPaymentErrorsViewModel(),
      );

      // Assert
      expect(viewModel.paymentCurrency).toBe('USD');
    });

    it('sets the view model bank to the edit payment response bank', () => {
      // Arrange
      const editPaymentResponseBody: GetPaymentDetailsWithFeeRecordsResponseBody = {
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        bank: {
          id: '123',
          name: 'Test bank',
        },
      };

      // Act
      const viewModel = getEditPaymentViewModelWithFormValues(
        editPaymentResponseBody,
        reportId,
        paymentId,
        isCheckboxChecked,
        aValidEditPaymentFormValuesObject(),
        aPaymentErrorsViewModel(),
      );

      // Assert
      expect(viewModel.bank).toEqual({ id: '123', name: 'Test bank' });
    });

    it('sets the view model formattedReportPeriod to the formatted edit payment response reportPeriod', () => {
      // Arrange
      const editPaymentResponseBody: GetPaymentDetailsWithFeeRecordsResponseBody = {
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        reportPeriod: {
          start: { month: 1, year: 2024 },
          end: { month: 1, year: 2024 },
        },
      };

      // Act
      const viewModel = getEditPaymentViewModelWithFormValues(
        editPaymentResponseBody,
        reportId,
        paymentId,
        isCheckboxChecked,
        aValidEditPaymentFormValuesObject(),
        aPaymentErrorsViewModel(),
      );

      // Assert
      expect(viewModel.formattedReportPeriod).toBe('January 2024');
    });

    it('sets the view model paymentCurrency to the edit payment details response payment currency', () => {
      // Arrange
      const paymentCurrency: Currency = 'USD';

      const editPaymentResponseBody: GetPaymentDetailsWithFeeRecordsResponseBody = {
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        payment: {
          ...aPayment(),
          currency: paymentCurrency,
        },
      };

      // Act
      const viewModel = getEditPaymentViewModelWithFormValues(
        editPaymentResponseBody,
        reportId,
        paymentId,
        isCheckboxChecked,
        aValidEditPaymentFormValuesObject(),
        aPaymentErrorsViewModel(),
      );

      // Assert
      expect(viewModel.paymentCurrency).toBe(paymentCurrency);
    });

    it('sets the render view model feeRecords id to the edit payment details response feeRecords id', () => {
      // Arrange
      const feeRecordIds = [1, 2];
      const feeRecords = feeRecordIds.map((id) => ({ ...aFeeRecord(), id }));

      const editPaymentResponseBody: GetPaymentDetailsWithFeeRecordsResponseBody = {
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        feeRecords,
      };

      // Act
      const viewModel = getEditPaymentViewModelWithFormValues(
        editPaymentResponseBody,
        reportId,
        paymentId,
        isCheckboxChecked,
        aValidEditPaymentFormValuesObject(),
        aPaymentErrorsViewModel(),
      );

      // Assert
      expect(viewModel.feeRecords).toHaveLength(feeRecordIds.length);
      viewModel.feeRecords.forEach(({ id }, index) => expect(id).toBe(feeRecordIds[index]));
    });

    it('sets the render view model feeRecords facilityId to the edit payment details response feeRecords facilityId', () => {
      // Arrange
      const feeRecordFacilityIds = ['12345678', '87654321'];
      const feeRecords = feeRecordFacilityIds.map((facilityId) => ({ ...aFeeRecord(), facilityId }));

      const editPaymentResponseBody: GetPaymentDetailsWithFeeRecordsResponseBody = {
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        feeRecords,
      };

      // Act
      const viewModel = getEditPaymentViewModelWithFormValues(
        editPaymentResponseBody,
        reportId,
        paymentId,
        isCheckboxChecked,
        aValidEditPaymentFormValuesObject(),
        aPaymentErrorsViewModel(),
      );

      // Assert
      expect(viewModel.feeRecords).toHaveLength(feeRecordFacilityIds.length);
      viewModel.feeRecords.forEach(({ facilityId }, index) => expect(facilityId).toBe(feeRecordFacilityIds[index]));
    });

    it('sets the render view model feeRecords exporter to the edit payment details response feeRecords exporter', () => {
      // Arrange
      const feeRecordExporters = ['12345678', '87654321'];
      const feeRecords = feeRecordExporters.map((exporter) => ({ ...aFeeRecord(), exporter }));

      const editPaymentResponseBody: GetPaymentDetailsWithFeeRecordsResponseBody = {
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        feeRecords,
      };

      // Act
      const viewModel = getEditPaymentViewModelWithFormValues(
        editPaymentResponseBody,
        reportId,
        paymentId,
        isCheckboxChecked,
        aValidEditPaymentFormValuesObject(),
        aPaymentErrorsViewModel(),
      );

      // Assert
      expect(viewModel.feeRecords).toHaveLength(feeRecordExporters.length);
      viewModel.feeRecords.forEach(({ exporter }, index) => expect(exporter).toBe(feeRecordExporters[index]));
    });

    it('sets the render view model feeRecords reportedFees to the edit payment details response feeRecords sorted and formatted reportedFees', () => {
      // Arrange
      const feeRecordReportedFees: CurrencyAndAmount[] = [
        { currency: 'GBP', amount: 100 },
        { currency: 'EUR', amount: 50 },
      ];
      const formattedReportedFees: SortedAndFormattedCurrencyAndAmount[] = [
        { formattedCurrencyAndAmount: 'GBP 100.00', dataSortValue: 1 },
        { formattedCurrencyAndAmount: 'EUR 50.00', dataSortValue: 0 },
      ];
      const feeRecords = feeRecordReportedFees.map((reportedFees) => ({ ...aFeeRecord(), reportedFees }));

      const editPaymentResponseBody: GetPaymentDetailsWithFeeRecordsResponseBody = {
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        feeRecords,
      };

      // Act
      const viewModel = getEditPaymentViewModelWithFormValues(
        editPaymentResponseBody,
        reportId,
        paymentId,
        isCheckboxChecked,
        aValidEditPaymentFormValuesObject(),
        aPaymentErrorsViewModel(),
      );

      // Assert
      expect(viewModel.feeRecords).toHaveLength(feeRecordReportedFees.length);
      viewModel.feeRecords.forEach(({ reportedFees }, index) => expect(reportedFees).toEqual(formattedReportedFees[index]));
    });

    it('sets the render view model feeRecords reportedPayments to the edit payment details response feeRecords sorted and formatted reportedPayments', () => {
      // Arrange
      const feeRecordReportedPayments: CurrencyAndAmount[] = [
        { currency: 'GBP', amount: 100 },
        { currency: 'EUR', amount: 50 },
      ];
      const formattedReportedPayments: SortedAndFormattedCurrencyAndAmount[] = [
        { formattedCurrencyAndAmount: 'GBP 100.00', dataSortValue: 1 },
        { formattedCurrencyAndAmount: 'EUR 50.00', dataSortValue: 0 },
      ];
      const feeRecords = feeRecordReportedPayments.map((reportedPayments) => ({ ...aFeeRecord(), reportedPayments }));

      const editPaymentResponseBody: GetPaymentDetailsWithFeeRecordsResponseBody = {
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        feeRecords,
      };

      // Act
      const viewModel = getEditPaymentViewModelWithFormValues(
        editPaymentResponseBody,
        reportId,
        paymentId,
        isCheckboxChecked,
        aValidEditPaymentFormValuesObject(),
        aPaymentErrorsViewModel(),
      );

      // Assert
      expect(viewModel.feeRecords).toHaveLength(feeRecordReportedPayments.length);
      viewModel.feeRecords.forEach(({ reportedPayments }, index) => expect(reportedPayments).toEqual(formattedReportedPayments[index]));
    });

    it("sets the render view model feeRecords checkboxId to 'feeRecordId-' followed by the fee record id", () => {
      // Arrange
      const feeRecordIds = [1, 2];
      const feeRecords = feeRecordIds.map((id) => ({ ...aFeeRecord(), id }));

      const editPaymentResponseBody: GetPaymentDetailsWithFeeRecordsResponseBody = {
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        feeRecords,
      };

      // Act
      const viewModel = getEditPaymentViewModelWithFormValues(
        editPaymentResponseBody,
        reportId,
        paymentId,
        isCheckboxChecked,
        aValidEditPaymentFormValuesObject(),
        aPaymentErrorsViewModel(),
      );

      // Assert
      expect(viewModel.feeRecords).toHaveLength(feeRecordIds.length);
      viewModel.feeRecords.forEach(({ checkboxId }, index) => expect(checkboxId).toBe(`feeRecordId-${feeRecordIds[index]}`));
    });

    it('sets the render view model feeRecords isChecked value using the provided isCheckboxChecked function for every fee record', () => {
      // Arrange
      const feeRecords = [
        { ...aFeeRecord(), id: 1 },
        { ...aFeeRecord(), id: 2 },
        { ...aFeeRecord(), id: 3 },
      ];
      const checkedFeeRecordIds = ['feeRecordId-1'];

      const mockIsCheckboxChecked = jest.fn().mockImplementation((id: string) => checkedFeeRecordIds.includes(id));

      const editPaymentResponseBody: GetPaymentDetailsWithFeeRecordsResponseBody = {
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        feeRecords,
      };

      // Act
      const viewModel = getEditPaymentViewModelWithFormValues(
        editPaymentResponseBody,
        reportId,
        paymentId,
        mockIsCheckboxChecked,
        aValidEditPaymentFormValuesObject(),
        aPaymentErrorsViewModel(),
      );

      // Assert
      expect(viewModel.feeRecords).toHaveLength(feeRecords.length);
      expect(mockIsCheckboxChecked).toHaveBeenCalledTimes(feeRecords.length);
      expect(viewModel.feeRecords[0].isChecked).toBe(true);
      expect(viewModel.feeRecords[1].isChecked).toBe(false);
    });

    it('sets the render view model totalReportedPayments to the edit payment details response formatted totalReportedPayments', () => {
      // Arrange
      const totalReportedPayments: CurrencyAndAmount = { currency: 'USD', amount: 314.59 };
      const editPaymentResponseBody: GetPaymentDetailsWithFeeRecordsResponseBody = {
        ...aPaymentDetailsWithFeeRecordsResponseBody(),
        totalReportedPayments,
      };

      // Act
      const viewModel = getEditPaymentViewModelWithFormValues(
        editPaymentResponseBody,
        reportId,
        paymentId,
        isCheckboxChecked,
        aValidEditPaymentFormValuesObject(),
        aPaymentErrorsViewModel(),
      );

      // Assert
      expect(viewModel.totalReportedPayments).toBe('USD 314.59');
    });

    it('sets the render view model errors to the supplied errors', () => {
      // Arrange
      const paymentErrors: PaymentErrorsViewModel = {
        errorSummary: [{ text: 'Some text', href: '#some-link' }],
        paymentAmountErrorMessage: 'Some message',
      };

      // Act
      const viewModel = getEditPaymentViewModelWithFormValues(
        aPaymentDetailsWithFeeRecordsResponseBody(),
        reportId,
        paymentId,
        isCheckboxChecked,
        aValidEditPaymentFormValuesObject(),
        paymentErrors,
      );

      // Assert
      expect(viewModel.errors).toEqual(paymentErrors);
    });

    it('sets the render view model errors to the empty errors if no errors are supplied', () => {
      // Act
      const viewModel = getEditPaymentViewModelWithFormValues(
        aPaymentDetailsWithFeeRecordsResponseBody(),
        reportId,
        paymentId,
        isCheckboxChecked,
        aValidEditPaymentFormValuesObject(),
      );

      // Assert
      expect(viewModel.errors).toEqual(EMPTY_PAYMENT_ERRORS_VIEW_MODEL);
    });

    it('sets the render view model formValues paymentAmount to the supplied formValues paymentAmount', () => {
      // Arrange
      const formValues: EditPaymentFormValues = {
        ...aValidEditPaymentFormValuesObject(),
        paymentAmount: '314.59',
      };

      // Act
      const viewModel = getEditPaymentViewModelWithFormValues(
        aPaymentDetailsWithFeeRecordsResponseBody(),
        reportId,
        paymentId,
        isCheckboxChecked,
        formValues,
        aPaymentErrorsViewModel(),
      );

      // Assert
      expect(viewModel.formValues.paymentAmount).toBe('314.59');
    });

    it('sets the render view model formValues paymentDate to the supplied formValues paymentDate object', () => {
      // Arrange
      const formValues: EditPaymentFormValues = {
        ...aValidEditPaymentFormValuesObject(),
        paymentDate: {
          day: '1',
          month: '5',
          year: '2024',
        },
      };

      // Act
      const viewModel = getEditPaymentViewModelWithFormValues(
        aPaymentDetailsWithFeeRecordsResponseBody(),
        reportId,
        paymentId,
        isCheckboxChecked,
        formValues,
        aPaymentErrorsViewModel(),
      );

      // Assert
      expect(viewModel.formValues.paymentDate).toEqual({
        day: '1',
        month: '5',
        year: '2024',
      });
    });

    it('sets the render view model formValues paymentReference to the supplied formValues paymentReference', () => {
      // Arrange
      const formValues: EditPaymentFormValues = {
        ...aValidEditPaymentFormValuesObject(),
        paymentReference: 'Some payment reference',
      };

      // Act
      const viewModel = getEditPaymentViewModelWithFormValues(
        aPaymentDetailsWithFeeRecordsResponseBody(),
        reportId,
        paymentId,
        isCheckboxChecked,
        formValues,
        aPaymentErrorsViewModel(),
      );

      // Assert
      expect(viewModel.formValues.paymentReference).toBe('Some payment reference');
    });

    it('sets the view model redirectTab to the supplied redirectTab', () => {
      // Arrange
      const redirectTab = RECONCILIATION_FOR_REPORT_TABS.KEYING_SHEET;

      // Act
      const viewModel = getEditPaymentViewModel(aPaymentDetailsWithFeeRecordsResponseBody(), reportId, paymentId, isCheckboxChecked, undefined, redirectTab);

      // Assert
      expect(viewModel.redirectTab).toEqual(redirectTab);
    });

    it('sets the back link to the reconciliation for report href using the supplied redirectTab', () => {
      // Arrange
      const redirectTab = RECONCILIATION_FOR_REPORT_TABS.KEYING_SHEET;

      jest.mocked(getReconciliationForReportHref).mockReturnValue('/utilisation-reports/123#keying-sheet');

      // Act
      const viewModel = getEditPaymentViewModel(aPaymentDetailsWithFeeRecordsResponseBody(), reportId, paymentId, isCheckboxChecked, undefined, redirectTab);

      // Assert
      expect(viewModel.backLinkHref).toEqual('/utilisation-reports/123#keying-sheet');
      expect(getReconciliationForReportHref).toHaveBeenCalledWith(reportId, redirectTab);
    });

    function aValidEditPaymentFormValuesObject(): EditPaymentFormValues {
      return {
        paymentAmount: '100',
        paymentDate: {
          day: '1',
          month: '5',
          year: '2024',
        },
        paymentReference: 'A payment reference',
      };
    }

    function aPaymentErrorsViewModel(): PaymentErrorsViewModel {
      return {
        errorSummary: [
          {
            text: 'Some text',
            href: 'Some href',
          },
        ],
      };
    }
  });
});
