import { when } from 'jest-when';
import { CURRENCY, Currency, CurrencyAndAmount, FEE_RECORD_STATUS, FeeRecordStatus } from '@ukef/dtfs2-common';
import { mapCurrenciesToRadioItems } from '../../../helpers/map-currencies-to-radio-items';
import {
  getFormattedDateReconciled,
  getFormattedReconciledByUser,
  mapPremiumPaymentsToViewModelItems,
  mapPaymentDetailsGroupsToPaymentDetailsViewModel,
  mapKeyingSheetToKeyingSheetViewModel,
  mapPaymentDetailsFiltersToViewModel,
} from './reconciliation-for-report-helper';
import { FeeRecord, KeyingSheet, KeyingSheetRow, Payment, PaymentDetails, PremiumPaymentsGroup } from '../../../api-response-types';
import { aPremiumPaymentsGroup, aFeeRecord, aPayment, aPaymentDetails } from '../../../../test-helpers';

describe('reconciliation-for-report-helper', () => {
  describe('mapPremiumPaymentsToViewModelItems', () => {
    const DEFAULT_IS_CHECKBOX_SELECTED = () => false;

    it('should map the group feeRecords id to the view model feeRecords id', () => {
      // Arrange
      const firstFeeRecordId = 10;
      const firstFeeRecord: FeeRecord = { ...aFeeRecord(), id: firstFeeRecordId };

      const secondFeeRecordId = 30;
      const secondFeeRecord: FeeRecord = { ...aFeeRecord(), id: secondFeeRecordId };

      const premiumPaymentGroups: PremiumPaymentsGroup[] = [
        {
          ...aPremiumPaymentsGroup(),
          feeRecords: [firstFeeRecord, secondFeeRecord],
        },
      ];

      // Act
      const viewModel = mapPremiumPaymentsToViewModelItems(premiumPaymentGroups, DEFAULT_IS_CHECKBOX_SELECTED);

      // Assert
      expect(viewModel).toHaveLength(1);
      expect(viewModel[0].feeRecords).toHaveLength(2);
      expect(viewModel[0].feeRecords[0].id).toEqual(firstFeeRecordId);
      expect(viewModel[0].feeRecords[1].id).toEqual(secondFeeRecordId);
    });

    it('should map the group feeRecords facilityId to the view model feeRecords facilityId', () => {
      // Arrange
      const firstFeeRecordFacilityId = '12345678';
      const firstFeeRecord: FeeRecord = { ...aFeeRecord(), facilityId: firstFeeRecordFacilityId };

      const secondFeeRecordFacilityId = '87654321';
      const secondFeeRecord: FeeRecord = { ...aFeeRecord(), facilityId: secondFeeRecordFacilityId };

      const premiumPaymentGroups: PremiumPaymentsGroup[] = [
        {
          ...aPremiumPaymentsGroup(),
          feeRecords: [firstFeeRecord, secondFeeRecord],
        },
      ];

      // Act
      const viewModel = mapPremiumPaymentsToViewModelItems(premiumPaymentGroups, DEFAULT_IS_CHECKBOX_SELECTED);

      // Assert
      expect(viewModel).toHaveLength(1);
      expect(viewModel[0].feeRecords).toHaveLength(2);
      expect(viewModel[0].feeRecords[0].facilityId).toEqual(firstFeeRecordFacilityId);
      expect(viewModel[0].feeRecords[1].facilityId).toEqual(secondFeeRecordFacilityId);
    });

    it('should map the group feeRecords exporter to the view model feeRecords exporter', () => {
      // Arrange
      const firstFeeRecordExporter = 'Test exporter 1';
      const firstFeeRecord: FeeRecord = { ...aFeeRecord(), exporter: firstFeeRecordExporter };

      const secondFeeRecordExporter = 'Test exporter 2';
      const secondFeeRecord: FeeRecord = { ...aFeeRecord(), exporter: secondFeeRecordExporter };

      const premiumPaymentGroups: PremiumPaymentsGroup[] = [
        {
          ...aPremiumPaymentsGroup(),
          feeRecords: [firstFeeRecord, secondFeeRecord],
        },
      ];

      // Act
      const viewModel = mapPremiumPaymentsToViewModelItems(premiumPaymentGroups, DEFAULT_IS_CHECKBOX_SELECTED);

      // Assert
      expect(viewModel).toHaveLength(1);
      expect(viewModel[0].feeRecords).toHaveLength(2);
      expect(viewModel[0].feeRecords[0].exporter).toEqual(firstFeeRecordExporter);
      expect(viewModel[0].feeRecords[1].exporter).toEqual(secondFeeRecordExporter);
    });

    it('should map the group feeRecords reportedFees to the view model feeRecords reportedFees formatted currency and amount', () => {
      // Arrange
      const firstFeeRecordReportedFees: CurrencyAndAmount = { currency: 'GBP', amount: 100 };
      const firstFeeRecord: FeeRecord = { ...aFeeRecord(), reportedFees: firstFeeRecordReportedFees };
      const firstFeeRecordFormattedReportedFees = 'GBP 100.00';

      const secondFeeRecordReportedFees: CurrencyAndAmount = { currency: 'EUR', amount: 314.59 };
      const secondFeeRecord: FeeRecord = { ...aFeeRecord(), reportedFees: secondFeeRecordReportedFees };
      const secondFeeRecordFormattedReportedFees = 'EUR 314.59';

      const premiumPaymentGroups: PremiumPaymentsGroup[] = [
        {
          ...aPremiumPaymentsGroup(),
          feeRecords: [firstFeeRecord, secondFeeRecord],
        },
      ];

      // Act
      const viewModel = mapPremiumPaymentsToViewModelItems(premiumPaymentGroups, DEFAULT_IS_CHECKBOX_SELECTED);

      // Assert
      expect(viewModel).toHaveLength(1);
      expect(viewModel[0].feeRecords).toHaveLength(2);
      expect(viewModel[0].feeRecords[0].reportedFees).toEqual(firstFeeRecordFormattedReportedFees);
      expect(viewModel[0].feeRecords[1].reportedFees).toEqual(secondFeeRecordFormattedReportedFees);
    });

    it('should map the group feeRecords reportedPayments to the view model feeRecords reportedPayments formatted currency and amount', () => {
      // Arrange
      const firstFeeRecordReportedPayments: CurrencyAndAmount = { currency: 'EUR', amount: 314.59 };
      const firstFeeRecord: FeeRecord = { ...aFeeRecord(), reportedPayments: firstFeeRecordReportedPayments };
      const firstFeeRecordFormattedReportedPayments = 'EUR 314.59';

      const secondFeeRecordReportedPayments: CurrencyAndAmount = { currency: 'GBP', amount: 100 };
      const secondFeeRecord: FeeRecord = { ...aFeeRecord(), reportedPayments: secondFeeRecordReportedPayments };
      const secondFeeRecordFormattedReportedPayments = 'GBP 100.00';

      const premiumPaymentGroups: PremiumPaymentsGroup[] = [
        {
          ...aPremiumPaymentsGroup(),
          feeRecords: [firstFeeRecord, secondFeeRecord],
        },
      ];

      // Act
      const viewModel = mapPremiumPaymentsToViewModelItems(premiumPaymentGroups, DEFAULT_IS_CHECKBOX_SELECTED);

      // Assert
      expect(viewModel).toHaveLength(1);
      expect(viewModel[0].feeRecords).toHaveLength(2);
      expect(viewModel[0].feeRecords[0].reportedPayments).toEqual(firstFeeRecordFormattedReportedPayments);
      expect(viewModel[0].feeRecords[1].reportedPayments).toEqual(secondFeeRecordFormattedReportedPayments);
    });

    it('should sort the view model feeRecords reportedPayments by currency first and amount second in ascending order', () => {
      // Arrange
      const unsortedFeeRecords: FeeRecord[] = [
        { ...aFeeRecord(), reportedPayments: { currency: 'GBP', amount: 100 } }, // after sorting: 'GBP 100.00' at index 1
        { ...aFeeRecord(), reportedPayments: { currency: 'USD', amount: 200 } }, // after sorting: 'USD 200.00' at index 4
        { ...aFeeRecord(), reportedPayments: { currency: 'EUR', amount: 100 } }, // after sorting: 'EUR 100.00' at index 0
        { ...aFeeRecord(), reportedPayments: { currency: 'USD', amount: 100 } }, // after sorting: 'USD 100.00' at index 3
        { ...aFeeRecord(), reportedPayments: { currency: 'GBP', amount: 500 } }, // after sorting: 'GBP 500.00' at index 2
      ];

      const premiumPaymentGroups: PremiumPaymentsGroup[] = [
        {
          ...aPremiumPaymentsGroup(),
          feeRecords: unsortedFeeRecords,
        },
      ];

      // Act
      const viewModel = mapPremiumPaymentsToViewModelItems(premiumPaymentGroups, DEFAULT_IS_CHECKBOX_SELECTED);

      // Assert
      expect(viewModel[0].feeRecords[0].reportedPayments).toEqual('EUR 100.00');
      expect(viewModel[0].feeRecords[1].reportedPayments).toEqual('GBP 100.00');
      expect(viewModel[0].feeRecords[2].reportedPayments).toEqual('GBP 500.00');
      expect(viewModel[0].feeRecords[3].reportedPayments).toEqual('USD 100.00');
      expect(viewModel[0].feeRecords[4].reportedPayments).toEqual('USD 200.00');
    });

    it('should map the group totalReportedPayments to the view model totalReportedPayments formattedCurrencyAndAmount', () => {
      // Arrange
      const totalReportedPayments: CurrencyAndAmount = { currency: 'GBP', amount: 100 };
      const totalReportedPaymentsFormattedCurrencyAndAmount = 'GBP 100.00';

      const premiumPaymentGroups: PremiumPaymentsGroup[] = [
        {
          ...aPremiumPaymentsGroup(),
          totalReportedPayments,
        },
      ];

      // Act
      const viewModel = mapPremiumPaymentsToViewModelItems(premiumPaymentGroups, DEFAULT_IS_CHECKBOX_SELECTED);

      // Assert
      expect(viewModel).toHaveLength(1);
      expect(viewModel[0].totalReportedPayments.formattedCurrencyAndAmount).toEqual(totalReportedPaymentsFormattedCurrencyAndAmount);
    });

    it('should sort the group totalReportedPayments and sets to the view model totalReportedPayments dataSortValue', () => {
      // Arrange
      const firstTotalReportedPayments: CurrencyAndAmount = { currency: 'GBP', amount: 100 }; // dataSortValue = 2
      const secondTotalReportedPayments: CurrencyAndAmount = { currency: 'EUR', amount: 100 }; // dataSortValue = 1
      const thirdTotalReportedPayments: CurrencyAndAmount = { currency: 'GBP', amount: 200 }; // dataSortValue = 3
      const fourthTotalReportedPayments: CurrencyAndAmount = { currency: 'EUR', amount: 50 }; // dataSortValue = 0

      const premiumPaymentGroups: PremiumPaymentsGroup[] = [
        { ...aPremiumPaymentsGroup(), totalReportedPayments: firstTotalReportedPayments },
        { ...aPremiumPaymentsGroup(), totalReportedPayments: secondTotalReportedPayments },
        { ...aPremiumPaymentsGroup(), totalReportedPayments: thirdTotalReportedPayments },
        { ...aPremiumPaymentsGroup(), totalReportedPayments: fourthTotalReportedPayments },
      ];

      // Act
      const viewModel = mapPremiumPaymentsToViewModelItems(premiumPaymentGroups, DEFAULT_IS_CHECKBOX_SELECTED);

      // Assert
      expect(viewModel).toHaveLength(4);
      expect(viewModel[0].totalReportedPayments.dataSortValue).toEqual(2);
      expect(viewModel[1].totalReportedPayments.dataSortValue).toEqual(1);
      expect(viewModel[2].totalReportedPayments.dataSortValue).toEqual(3);
      expect(viewModel[3].totalReportedPayments.dataSortValue).toEqual(0);
    });

    it('should set the view model paymentsReceived to undefined when the group paymentsReceived is null', () => {
      // Arrange
      const premiumPaymentGroups: PremiumPaymentsGroup[] = [{ ...aPremiumPaymentsGroup(), paymentsReceived: null }];

      // Act
      const viewModel = mapPremiumPaymentsToViewModelItems(premiumPaymentGroups, DEFAULT_IS_CHECKBOX_SELECTED);

      // Assert
      expect(viewModel).toHaveLength(1);
      expect(viewModel[0].paymentsReceived).toBeUndefined();
    });

    it('should map the group paymentsReceived to the view model paymentsReceived formatted currency and amount', () => {
      // Arrange
      const paymentsReceived: Payment[] = [{ ...aPayment(), id: 1, currency: 'GBP', amount: 314.59 }];
      const paymentsReceivedFormattedCurrencyAndAmount = 'GBP 314.59';

      const premiumPaymentGroups: PremiumPaymentsGroup[] = [
        {
          ...aPremiumPaymentsGroup(),
          paymentsReceived,
        },
      ];

      // Act
      const viewModel = mapPremiumPaymentsToViewModelItems(premiumPaymentGroups, DEFAULT_IS_CHECKBOX_SELECTED);

      // Assert
      expect(viewModel[0].paymentsReceived).toHaveLength(1);
      expect(viewModel[0].paymentsReceived![0].formattedCurrencyAndAmount).toEqual(paymentsReceivedFormattedCurrencyAndAmount);
    });

    it('should map the group paymentsReceived id to the view model paymentsReceived id', () => {
      // Arrange
      const paymentsReceived: Payment[] = [{ ...aPayment(), id: 1, currency: 'GBP', amount: 100 }];

      const premiumPaymentGroups: PremiumPaymentsGroup[] = [
        {
          ...aPremiumPaymentsGroup(),
          paymentsReceived,
        },
      ];

      // Act
      const viewModel = mapPremiumPaymentsToViewModelItems(premiumPaymentGroups, DEFAULT_IS_CHECKBOX_SELECTED);

      // Assert
      expect(viewModel[0].paymentsReceived).toHaveLength(1);
      expect(viewModel[0].paymentsReceived![0].id).toEqual(1);
    });

    it('should set the view model totalPaymentsReceived formattedCurrencyAndAmount to undefined when the group totalPaymentsReceived is null', () => {
      // Arrange
      const premiumPaymentGroups: PremiumPaymentsGroup[] = [
        {
          ...aPremiumPaymentsGroup(),
          totalPaymentsReceived: null,
        },
      ];

      // Act
      const viewModel = mapPremiumPaymentsToViewModelItems(premiumPaymentGroups, DEFAULT_IS_CHECKBOX_SELECTED);

      // Assert
      expect(viewModel).toHaveLength(1);
      expect(viewModel[0].totalPaymentsReceived.formattedCurrencyAndAmount).toBeUndefined();
    });

    it('should map the group totalPaymentsReceived to the view model totalPaymentsReceived formattedCurrencyAndAmount', () => {
      // Arrange
      const totalPaymentsReceived: CurrencyAndAmount = { currency: 'GBP', amount: 100 };
      const totalPaymentsReceivedFormattedCurrencyAndAmount = 'GBP 100.00';

      const premiumPaymentGroups: PremiumPaymentsGroup[] = [
        {
          ...aPremiumPaymentsGroup(),
          totalPaymentsReceived,
        },
      ];

      // Act
      const viewModel = mapPremiumPaymentsToViewModelItems(premiumPaymentGroups, DEFAULT_IS_CHECKBOX_SELECTED);

      // Assert
      expect(viewModel).toHaveLength(1);
      expect(viewModel[0].totalPaymentsReceived.formattedCurrencyAndAmount).toEqual(totalPaymentsReceivedFormattedCurrencyAndAmount);
    });

    it('should sort the group totalPaymentsReceived and sets to the view model totalPaymentsReceived dataSortValue', () => {
      // Arrange
      const firstTotalPaymentsReceived: CurrencyAndAmount = { currency: 'GBP', amount: 100 }; // dataSortValue = 2
      const secondTotalPaymentsReceived: CurrencyAndAmount = { currency: 'EUR', amount: 100 }; // dataSortValue = 1
      const thirdTotalPaymentsReceived: CurrencyAndAmount = { currency: 'GBP', amount: 200 }; // dataSortValue = 3
      const fourthTotalPaymentsReceived: CurrencyAndAmount = { currency: 'EUR', amount: 50 }; // dataSortValue = 0

      const premiumPaymentGroups: PremiumPaymentsGroup[] = [
        { ...aPremiumPaymentsGroup(), totalPaymentsReceived: firstTotalPaymentsReceived },
        { ...aPremiumPaymentsGroup(), totalPaymentsReceived: secondTotalPaymentsReceived },
        { ...aPremiumPaymentsGroup(), totalPaymentsReceived: thirdTotalPaymentsReceived },
        { ...aPremiumPaymentsGroup(), totalPaymentsReceived: fourthTotalPaymentsReceived },
      ];

      // Act
      const viewModel = mapPremiumPaymentsToViewModelItems(premiumPaymentGroups, DEFAULT_IS_CHECKBOX_SELECTED);

      // Assert
      expect(viewModel).toHaveLength(4);
      expect(viewModel[0].totalPaymentsReceived.dataSortValue).toEqual(2);
      expect(viewModel[1].totalPaymentsReceived.dataSortValue).toEqual(1);
      expect(viewModel[2].totalPaymentsReceived.dataSortValue).toEqual(3);
      expect(viewModel[3].totalPaymentsReceived.dataSortValue).toEqual(0);
    });

    it('should map the group status to the view model status', () => {
      // Arrange
      const status: FeeRecordStatus = FEE_RECORD_STATUS.TO_DO;
      const premiumPaymentGroups: PremiumPaymentsGroup[] = [{ ...aPremiumPaymentsGroup(), status }];

      // Act
      const viewModel = mapPremiumPaymentsToViewModelItems(premiumPaymentGroups, DEFAULT_IS_CHECKBOX_SELECTED);

      // Assert
      expect(viewModel).toHaveLength(1);
      expect(viewModel[0].status).toEqual(status);
    });

    it.each([
      { feeRecordStatus: FEE_RECORD_STATUS.TO_DO, feeRecordDisplayStatus: 'TO DO' },
      { feeRecordStatus: FEE_RECORD_STATUS.MATCH, feeRecordDisplayStatus: 'MATCH' },
      { feeRecordStatus: FEE_RECORD_STATUS.DOES_NOT_MATCH, feeRecordDisplayStatus: 'DOES NOT MATCH' },
      { feeRecordStatus: FEE_RECORD_STATUS.READY_TO_KEY, feeRecordDisplayStatus: 'READY TO KEY' },
      { feeRecordStatus: FEE_RECORD_STATUS.RECONCILED, feeRecordDisplayStatus: 'RECONCILED' },
    ] as const)(
      "maps the fee record status '$feeRecordStatus' to the view model display status '$feeRecordDisplayStatus'",
      ({ feeRecordStatus, feeRecordDisplayStatus }) => {
        // Arrange
        const premiumPaymentGroups: PremiumPaymentsGroup[] = [{ ...aPremiumPaymentsGroup(), status: feeRecordStatus }];

        // Act
        const viewModel = mapPremiumPaymentsToViewModelItems(premiumPaymentGroups, DEFAULT_IS_CHECKBOX_SELECTED);

        // Assert
        expect(viewModel[0].displayStatus).toEqual(feeRecordDisplayStatus);
      },
    );

    it('should set the view model checkboxId using the supplied fee record items for the ids, currency and the group status for the status', () => {
      // Arrange
      const feeRecordIds = [1, 20];

      const firstFeeRecordReportedPaymentsCurrency: Currency = 'GBP';
      const firstFeeRecord: FeeRecord = {
        ...aFeeRecord(),
        id: feeRecordIds[0],
        reportedPayments: {
          currency: firstFeeRecordReportedPaymentsCurrency,
          amount: 100,
        },
      };

      const secondFeeRecord: FeeRecord = {
        ...aFeeRecord(),
        id: feeRecordIds[1],
        reportedPayments: {
          currency: 'EUR',
          amount: 100,
        },
      };

      const feeRecords = [firstFeeRecord, secondFeeRecord];

      const groupStatus: FeeRecordStatus = FEE_RECORD_STATUS.TO_DO;

      const premiumPaymentGroups: PremiumPaymentsGroup[] = [{ ...aPremiumPaymentsGroup(), feeRecords, status: groupStatus }];

      const checkboxId = `feeRecordIds-${feeRecordIds.join(',')}-reportedPaymentsCurrency-${firstFeeRecordReportedPaymentsCurrency}-status-${groupStatus}`;

      // Act
      const viewModel = mapPremiumPaymentsToViewModelItems(premiumPaymentGroups, DEFAULT_IS_CHECKBOX_SELECTED);

      // Assert
      expect(viewModel[0].checkboxId).toEqual(checkboxId);
    });

    it('should set isChecked to true if the payment groups fee record ids are recognised by the supplied isCheckboxChecked function', () => {
      // Arrange
      const feeRecordId = 1;
      const feeRecordReportedPaymentsCurrency: Currency = 'GBP';
      const feeRecord: FeeRecord = {
        ...aFeeRecord(),
        id: feeRecordId,
        reportedPayments: {
          currency: feeRecordReportedPaymentsCurrency,
          amount: 100,
        },
      };

      const status = FEE_RECORD_STATUS.DOES_NOT_MATCH;

      const premiumPaymentGroups: PremiumPaymentsGroup[] = [{ ...aPremiumPaymentsGroup(), feeRecords: [feeRecord], status }];

      const isCheckboxChecked = jest.fn().mockReturnValue(false);
      when(isCheckboxChecked).calledWith([feeRecordId]).mockReturnValue(true);

      // Act
      const viewModel = mapPremiumPaymentsToViewModelItems(premiumPaymentGroups, isCheckboxChecked);

      // Assert
      expect(viewModel[0].isChecked).toEqual(true);
    });

    it('should set isChecked to false if the payment groups fee record ids are not recognised by the supplied isCheckboxChecked function', () => {
      // Arrange
      const feeRecordId = 1;
      const nonMatchingFeeRecordId = 5;
      const feeRecordReportedPaymentsCurrency: Currency = 'GBP';
      const feeRecord: FeeRecord = {
        ...aFeeRecord(),
        id: feeRecordId,
        reportedPayments: {
          currency: feeRecordReportedPaymentsCurrency,
          amount: 100,
        },
      };

      const status = FEE_RECORD_STATUS.DOES_NOT_MATCH;

      const premiumPaymentGroups: PremiumPaymentsGroup[] = [{ ...aPremiumPaymentsGroup(), feeRecords: [feeRecord], status }];

      const isCheckboxChecked = jest.fn().mockReturnValue(false);
      when(isCheckboxChecked).calledWith([nonMatchingFeeRecordId]).mockReturnValue(true);

      // Act
      const viewModel = mapPremiumPaymentsToViewModelItems(premiumPaymentGroups, isCheckboxChecked);

      // Assert
      expect(viewModel[0].isChecked).toEqual(false);
    });

    it('should set the checkbox aria label to "Select" followed by the fee record facility ids', () => {
      // Arrange
      const firstFeeRecord: FeeRecord = {
        ...aFeeRecord(),
        facilityId: '123',
      };

      const secondFeeRecord: FeeRecord = {
        ...aFeeRecord(),
        facilityId: '456',
      };

      const feeRecords = [firstFeeRecord, secondFeeRecord];

      const premiumPaymentGroups: PremiumPaymentsGroup[] = [{ ...aPremiumPaymentsGroup(), feeRecords }];

      // Act
      const viewModel = mapPremiumPaymentsToViewModelItems(premiumPaymentGroups, DEFAULT_IS_CHECKBOX_SELECTED);

      // Assert
      expect(viewModel[0].checkboxAriaLabel).toEqual('Select 123 456');
    });
  });

  describe('mapKeyingSheetToKeyingSheetViewModel', () => {
    const aKeyingSheetRow = (): KeyingSheetRow => ({
      feeRecordId: 1,
      status: 'TO_DO',
      facilityId: '12345678',
      exporter: 'Test exporter',
      feePayments: [],
      baseCurrency: 'GBP',
      fixedFeeAdjustment: null,
      principalBalanceAdjustment: null,
    });

    it('should map the keying sheet status, facility id, feeRecordId, exporter and base currency', () => {
      // Arrange
      const keyingSheet: KeyingSheet = [
        {
          ...aKeyingSheetRow(),
          status: 'TO_DO',
          facilityId: '11111111',
          exporter: 'Some exporter',
          baseCurrency: 'JPY',
          feeRecordId: 11,
        },
      ];

      // Act
      const result = mapKeyingSheetToKeyingSheetViewModel(keyingSheet);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].status).toEqual('TO_DO');
      expect(result[0].facilityId).toEqual('11111111');
      expect(result[0].exporter).toEqual('Some exporter');
      expect(result[0].baseCurrency).toEqual('JPY');
      expect(result[0].feeRecordId).toEqual(11);
    });

    it.each([
      { status: 'TO_DO', displayStatus: 'TO DO' },
      { status: 'DONE', displayStatus: 'DONE' },
    ] as const)(
      "sets the keying sheet view model display status to '$displayStatus' when the keying sheet status is '$status'",
      ({ status, displayStatus }) => {
        // Arrange
        const keyingSheet: KeyingSheet = [{ ...aKeyingSheetRow(), status }];

        // Act
        const result = mapKeyingSheetToKeyingSheetViewModel(keyingSheet);

        // Assert
        expect(result).toHaveLength(1);
        expect(result[0].displayStatus).toEqual(displayStatus);
      },
    );

    it('should map the keying sheet feePayments to the view model feePayments formattedCurrencyAndAmount and formattedDateReceived', () => {
      // Arrange
      const keyingSheet: KeyingSheet = [
        {
          ...aKeyingSheetRow(),
          feePayments: [
            { currency: 'GBP', amount: 100.123, dateReceived: '2024-01-01T12:00:00.000' },
            { currency: 'EUR', amount: 90.91, dateReceived: '2023-12-05T12:00:00.000' },
            { currency: 'GBP', amount: 0.0123123, dateReceived: '2024-05-01T12:00:00.000' },
            { currency: 'JPY', amount: 0, dateReceived: null },
          ],
        },
      ];

      // Act
      const result = mapKeyingSheetToKeyingSheetViewModel(keyingSheet);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].feePayments).toHaveLength(4);
      expect(result[0].feePayments[0].formattedCurrencyAndAmount).toEqual('GBP 100.12');
      expect(result[0].feePayments[0].formattedDateReceived).toEqual('1 Jan 2024');
      expect(result[0].feePayments[1].formattedCurrencyAndAmount).toEqual('EUR 90.91');
      expect(result[0].feePayments[1].formattedDateReceived).toEqual('5 Dec 2023');
      expect(result[0].feePayments[2].formattedCurrencyAndAmount).toEqual('GBP 0.01');
      expect(result[0].feePayments[2].formattedDateReceived).toEqual('1 May 2024');
      expect(result[0].feePayments[3].formattedCurrencyAndAmount).toEqual('JPY 0.00');
      expect(result[0].feePayments[3].formattedDateReceived).toEqual(undefined);
    });

    it.each([
      { condition: 'is null', value: null, expectedMappedValue: { amount: undefined, change: 'NONE' } },
      { condition: 'has zero amount (no change)', value: { amount: 0, change: 'NONE' }, expectedMappedValue: { amount: '0.00', change: 'NONE' } },
      {
        condition: 'has a positive amount (increase)',
        value: { amount: 1234567.89, change: 'INCREASE' },
        expectedMappedValue: { amount: '1,234,567.89', change: 'INCREASE' },
      },
      {
        condition: 'has a negative amount (decrease)',
        value: { amount: 1234567.89, change: 'DECREASE' },
        expectedMappedValue: { amount: '1,234,567.89', change: 'DECREASE' },
      },
    ] as const)(
      'sets the view model fixedFeeAdjustment to $expectedMappedValue when the fee record entity fixedFeeAdjustment $condition',
      ({ value, expectedMappedValue }) => {
        // Arrange
        const keyingSheet: KeyingSheet = [
          {
            ...aKeyingSheetRow(),
            fixedFeeAdjustment: value,
          },
        ];

        // Act
        const result = mapKeyingSheetToKeyingSheetViewModel(keyingSheet);

        // Assert
        expect(result).toHaveLength(1);
        expect(result[0].fixedFeeAdjustment).toEqual(expectedMappedValue);
      },
    );

    it.each([
      { condition: 'is null', value: null, expectedMappedValue: { amount: undefined, change: 'NONE' } },
      { condition: 'has zero amount (no change)', value: { amount: 0, change: 'NONE' }, expectedMappedValue: { amount: '0.00', change: 'NONE' } },
      {
        condition: 'has a positive amount (increase)',
        value: { amount: 1234567.89, change: 'INCREASE' },
        expectedMappedValue: { amount: '1,234,567.89', change: 'INCREASE' },
      },
      {
        condition: 'has a negative amount (decrease)',
        value: { amount: 1234567.89, change: 'DECREASE' },
        expectedMappedValue: { amount: '1,234,567.89', change: 'DECREASE' },
      },
    ] as const)(
      'sets the view model principalBalanceAdjustment to $expectedMappedValue when the keying sheet principalBalanceAdjustment $condition',
      ({ value, expectedMappedValue }) => {
        // Arrange
        const keyingSheet: KeyingSheet = [
          {
            ...aKeyingSheetRow(),
            principalBalanceAdjustment: value,
          },
        ];

        // Act
        const result = mapKeyingSheetToKeyingSheetViewModel(keyingSheet);

        // Assert
        expect(result).toHaveLength(1);
        expect(result[0].principalBalanceAdjustment).toEqual(expectedMappedValue);
      },
    );

    it('should set the keying sheet view model checkbox id using the keying sheet fee record id and status', () => {
      // Arrange
      const keyingSheet: KeyingSheet = [{ ...aKeyingSheetRow(), feeRecordId: 123, status: 'TO_DO' }];

      // Act
      const result = mapKeyingSheetToKeyingSheetViewModel(keyingSheet);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].checkboxId).toEqual('feeRecordId-123-status-TO_DO');
    });
  });

  describe('mapPaymentDetailsGroupsToPaymentDetailsViewModel', () => {
    it('should create a list item for each of the supplied groups', () => {
      // Arrange
      const firstGroup: PaymentDetails = {
        ...aPaymentDetails(),
        feeRecords: [aFeeRecord(), aFeeRecord()],
        payment: aPayment(),
      };
      const secondGroup: PaymentDetails = {
        ...aPaymentDetails(),
        feeRecords: [aFeeRecord(), aFeeRecord(), aFeeRecord()],
        payment: aPayment(),
      };

      // Act
      const result = mapPaymentDetailsGroupsToPaymentDetailsViewModel([firstGroup, secondGroup]);

      // Assert
      expect(result).toHaveLength(2);
    });

    it('should map the payment id and reference to the payment details view model reference', () => {
      // Arrange
      const firstGroup: PaymentDetails = {
        ...aPaymentDetails(),
        feeRecords: [aFeeRecord()],
        payment: { ...aPayment(), id: 123, reference: 'First reference' },
      };
      const secondGroup: PaymentDetails = {
        ...aPaymentDetails(),
        feeRecords: [aFeeRecord()],
        payment: { ...aPayment(), id: 456, reference: 'Second reference' },
      };
      const thirdGroup: PaymentDetails = {
        ...aPaymentDetails(),
        feeRecords: [aFeeRecord()],
        payment: { ...aPayment(), id: 789, reference: undefined },
      };

      // Act
      const result = mapPaymentDetailsGroupsToPaymentDetailsViewModel([firstGroup, secondGroup, thirdGroup]);

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].payment.id).toEqual(123);
      expect(result[0].payment.reference).toEqual('First reference');
      expect(result[1].payment.id).toEqual(456);
      expect(result[1].payment.reference).toEqual('Second reference');
      expect(result[2].payment.id).toEqual(789);
      expect(result[2].payment.reference).toBeUndefined();
    });

    it('should map the fee records to an array of facility ids and exporters linked to the payment in the same group', () => {
      // Arrange
      const firstGroup: PaymentDetails = {
        ...aPaymentDetails(),
        feeRecords: [{ ...aFeeRecord(), id: 1, facilityId: '11111111', exporter: 'Test exporter 1' }],
        payment: aPayment(),
      };
      const secondGroup: PaymentDetails = {
        ...aPaymentDetails(),
        feeRecords: [{ ...aFeeRecord(), id: 2, facilityId: '22222222', exporter: 'Test exporter 2' }],
        payment: aPayment(),
      };

      // Act
      const result = mapPaymentDetailsGroupsToPaymentDetailsViewModel([firstGroup, secondGroup]);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].feeRecords).toHaveLength(1);
      expect(result[0].feeRecords[0]).toEqual({ id: 1, facilityId: '11111111', exporter: 'Test exporter 1' });
      expect(result[1].feeRecords).toHaveLength(1);
      expect(result[1].feeRecords[0]).toEqual({ id: 2, facilityId: '22222222', exporter: 'Test exporter 2' });
    });

    it('should map the fee records in the group to an array of facility ids and exporters when a payment has multiple fee records', () => {
      // Arrange
      const group: PaymentDetails = {
        ...aPaymentDetails(),
        feeRecords: [
          { ...aFeeRecord(), id: 1, facilityId: '11111111', exporter: 'Test exporter 1' },
          { ...aFeeRecord(), id: 2, facilityId: '22222222', exporter: 'Test exporter 2' },
          { ...aFeeRecord(), id: 3, facilityId: '33333333', exporter: 'Test exporter 3' },
        ],
        payment: aPayment(),
      };

      // Act
      const result = mapPaymentDetailsGroupsToPaymentDetailsViewModel([group]);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].feeRecords).toHaveLength(3);
      expect(result[0].feeRecords[0]).toEqual({ id: 1, facilityId: '11111111', exporter: 'Test exporter 1' });
      expect(result[0].feeRecords[1]).toEqual({ id: 2, facilityId: '22222222', exporter: 'Test exporter 2' });
      expect(result[0].feeRecords[2]).toEqual({ id: 3, facilityId: '33333333', exporter: 'Test exporter 3' });
    });

    it('should map the fee records to an array of facility ids and exporters when a group has multiple fee records', () => {
      // Arrange
      const group: PaymentDetails = {
        ...aPaymentDetails(),
        feeRecords: [
          { ...aFeeRecord(), id: 1, facilityId: '11111111', exporter: 'Test exporter 1' },
          { ...aFeeRecord(), id: 2, facilityId: '22222222', exporter: 'Test exporter 2' },
          { ...aFeeRecord(), id: 3, facilityId: '33333333', exporter: 'Test exporter 3' },
        ],
        payment: aPayment(),
      };

      // Act
      const result = mapPaymentDetailsGroupsToPaymentDetailsViewModel([group]);

      // Assert
      expect(result).toHaveLength(1);

      expect(result[0].feeRecords).toHaveLength(3);
      expect(result[0].feeRecords[0]).toEqual({ id: 1, facilityId: '11111111', exporter: 'Test exporter 1' });
      expect(result[0].feeRecords[1]).toEqual({ id: 2, facilityId: '22222222', exporter: 'Test exporter 2' });
      expect(result[0].feeRecords[2]).toEqual({ id: 3, facilityId: '33333333', exporter: 'Test exporter 3' });
    });

    it('should map the payment to a formatted currency and amount sorted first by currency alphabetically and second by amount ascending', () => {
      // Arrange
      const groups: PaymentDetails[] = [
        {
          ...aPaymentDetails(),
          feeRecords: [aFeeRecord()],
          payment: { ...aPayment(), id: 1, currency: 'GBP', amount: 200 }, // 'GBP 200.00', dataSortValue = 2
        },
        {
          ...aPaymentDetails(),
          feeRecords: [aFeeRecord()],
          payment: { ...aPayment(), id: 2, currency: 'USD', amount: 50 }, // 'USD 50.00', dataSortValue = 4
        },
        {
          ...aPaymentDetails(),
          feeRecords: [aFeeRecord()],
          payment: { ...aPayment(), id: 3, currency: 'GBP', amount: 100 }, // 'GBP 100.00', dataSortValue = 1
        },
        {
          ...aPaymentDetails(),
          feeRecords: [aFeeRecord()],
          payment: { ...aPayment(), id: 4, currency: 'EUR', amount: 200 }, // 'EUR 200.00', dataSortValue = 0
        },
        {
          ...aPaymentDetails(),
          feeRecords: [aFeeRecord()],
          payment: { ...aPayment(), id: 5, currency: 'GBP', amount: 300 }, // 'GBP 300.00', dataSortValue = 3
        },
      ];

      // Act
      const result = mapPaymentDetailsGroupsToPaymentDetailsViewModel(groups);

      // Assert
      expect(result).toHaveLength(5);
      expect(result.map(({ payment }) => payment.amount)).toEqual([
        { formattedCurrencyAndAmount: 'GBP 200.00', dataSortValue: 2 },
        { formattedCurrencyAndAmount: 'USD 50.00', dataSortValue: 4 },
        { formattedCurrencyAndAmount: 'GBP 100.00', dataSortValue: 1 },
        { formattedCurrencyAndAmount: 'EUR 200.00', dataSortValue: 0 },
        { formattedCurrencyAndAmount: 'GBP 300.00', dataSortValue: 3 },
      ]);
    });

    it('should map the payment to a formatted date received sorted by date ascending', () => {
      // Arrange
      const groups: PaymentDetails[] = [
        {
          ...aPaymentDetails(),
          feeRecords: [aFeeRecord()],
          payment: { ...aPayment(), id: 1, dateReceived: new Date('2024-06-01').toISOString() }, // '1 Jun 2024', dataSortValue = 3
        },
        {
          ...aPaymentDetails(),
          feeRecords: [aFeeRecord()],
          payment: { ...aPayment(), id: 2, dateReceived: new Date('2024-07-01').toISOString() }, // '1 Jul 2024', dataSortValue = 4
        },
        {
          ...aPaymentDetails(),
          feeRecords: [aFeeRecord()],
          payment: { ...aPayment(), id: 3, dateReceived: new Date('2024-03-01').toISOString() }, // '1 Mar 2024', dataSortValue = 0
        },
        {
          ...aPaymentDetails(),
          feeRecords: [aFeeRecord()],
          payment: { ...aPayment(), id: 4, dateReceived: new Date('2024-05-01').toISOString() }, // '1 May 2024', dataSortValue = 2
        },
        {
          ...aPaymentDetails(),
          feeRecords: [aFeeRecord()],
          payment: { ...aPayment(), id: 5, dateReceived: new Date('2024-04-01').toISOString() }, // '1 Apr 2024', dataSortValue = 1
        },
      ];

      // Act
      const result = mapPaymentDetailsGroupsToPaymentDetailsViewModel(groups);

      // Assert
      expect(result).toHaveLength(5);
      expect(result.map(({ payment }) => payment.dateReceived)).toEqual([
        { formattedDateReceived: '1 Jun 2024', dataSortValue: 3 },
        { formattedDateReceived: '1 Jul 2024', dataSortValue: 4 },
        { formattedDateReceived: '1 Mar 2024', dataSortValue: 0 },
        { formattedDateReceived: '1 May 2024', dataSortValue: 2 },
        { formattedDateReceived: '1 Apr 2024', dataSortValue: 1 },
      ]);
    });

    it('should map the reconciledByUser to the payment details reconciledBy field with value "-" when the reconciledByUser is undefined', () => {
      // Arrange
      const group: PaymentDetails = {
        ...aPaymentDetails(),
        feeRecords: [aFeeRecord()],
        payment: aPayment(),
        reconciledByUser: undefined,
      };

      // Act
      const result = mapPaymentDetailsGroupsToPaymentDetailsViewModel([group]);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].reconciledBy).toEqual('-');
    });

    it('should map the reconciledByUser to the payment details reconciledBy field', () => {
      // Arrange
      const group: PaymentDetails = {
        ...aPaymentDetails(),
        reconciledByUser: { firstName: 'John', lastName: 'Smith' },
      };

      // Act
      const result = mapPaymentDetailsGroupsToPaymentDetailsViewModel([group]);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].reconciledBy).toEqual('John Smith');
    });

    it('should map the dateReconciled to the payment details dateReconciled field with value "-" when the dateReconciled is undefined', () => {
      // Arrange
      const group: PaymentDetails = {
        ...aPaymentDetails(),
        dateReconciled: undefined,
      };

      // Act
      const result = mapPaymentDetailsGroupsToPaymentDetailsViewModel([group]);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].dateReconciled.formattedDateReconciled).toEqual('-');
    });

    it.each([
      { dateReconciled: '2024-01-12T15:30:00.000', formattedDate: '12 Jan 2024 at 03:30pm' },
      { dateReconciled: '2024-12-01T10:30:00.000', formattedDate: '1 Dec 2024 at 10:30am' },
    ])("maps a dateReconciled value of '$dateReconciled' to the formatted date '$formattedDate'", ({ dateReconciled, formattedDate }) => {
      // Arrange
      const group: PaymentDetails = {
        ...aPaymentDetails(),
        dateReconciled,
      };

      // Act
      const result = mapPaymentDetailsGroupsToPaymentDetailsViewModel([group]);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].dateReconciled.formattedDateReconciled).toEqual(formattedDate);
    });

    it('should sort the dateReconciled by date ascending with undefined dates being at the start of the sorted list', () => {
      // Arrange
      const firstGroup: PaymentDetails = {
        ...aPaymentDetails(),
        payment: { ...aPayment(), id: 0 }, // dataSortValue = 0
        dateReconciled: '2024-01-01T03:00:00.000', // dataSortValue = 2,
      };

      const secondGroup: PaymentDetails = {
        ...aPaymentDetails(),
        payment: { ...aPayment(), id: 2 }, // dataSortValue = 1
        dateReconciled: '2024-01-01T00:00:00.000', // dataSortValue = 1
      };

      const thirdGroup: PaymentDetails = {
        ...aPaymentDetails(),
        payment: { ...aPayment(), id: 1 }, // dataSortValue = 2,
        dateReconciled: undefined, // dataSortValue = 0
      };

      // Act
      const result = mapPaymentDetailsGroupsToPaymentDetailsViewModel([firstGroup, secondGroup, thirdGroup]);

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].dateReconciled.dataSortValue).toEqual(2);
      expect(result[1].dateReconciled.dataSortValue).toEqual(1);
      expect(result[2].dateReconciled.dataSortValue).toEqual(0);
    });
  });

  describe('getFormattedReconciledByUser', () => {
    it('should return the formatted reconciled by user', () => {
      // Arrange
      const reconciledByUser = { firstName: 'John', lastName: 'Smith' };

      // Act
      const result = getFormattedReconciledByUser(reconciledByUser);

      // Assert
      expect(result).toEqual('John Smith');
    });

    it('should return the "-" character when the supplied user is undefined', () => {
      // Act
      const result = getFormattedReconciledByUser(undefined);

      // Assert
      expect(result).toEqual('-');
    });
  });

  describe('getFormattedDateReconciled', () => {
    it('should return the formatted date reconciled using "am" when the date is in the morning', () => {
      // Arrange
      const dateReconciled = '2024-01-01T10:45:00.000';

      // Act
      const result = getFormattedDateReconciled(dateReconciled);

      // Assert
      expect(result).toEqual('1 Jan 2024 at 10:45am');
    });

    it('should return the formatted date reconciled using "pm" when the date is in the afternoon', () => {
      // Arrange
      const dateReconciled = '2024-01-01T15:45:00.000';

      // Act
      const result = getFormattedDateReconciled(dateReconciled);

      // Assert
      expect(result).toEqual('1 Jan 2024 at 03:45pm');
    });

    it('should return the "-" character when the supplied date reconciled is undefined', () => {
      // Act
      const result = getFormattedDateReconciled(undefined);

      // Assert
      expect(result).toEqual('-');
    });
  });

  describe('mapPaymentDetailsFiltersToViewModel', () => {
    describe('when payment currency filter is defined', () => {
      it('should map payment details filters to view model with radio items for currencies with the provided currency checked', () => {
        // Arrange
        const paymentDetailsFilters = {
          facilityId: '11111111',
          paymentCurrency: CURRENCY.GBP,
          paymentReference: 'some-payment-reference',
        };

        // Act
        const result = mapPaymentDetailsFiltersToViewModel(paymentDetailsFilters);

        // Assert
        expect(result).toEqual({
          ...paymentDetailsFilters,
          paymentCurrency: mapCurrenciesToRadioItems(paymentDetailsFilters.paymentCurrency),
        });
      });
    });

    describe('when payment currency filter is undefined', () => {
      it('should map payment details filters to view model with radio items for currencies with no currencies checked', () => {
        // Arrange
        const paymentDetailsFilters = {
          facilityId: '11111111',
          paymentReference: 'some-payment-reference',
        };

        // Act
        const result = mapPaymentDetailsFiltersToViewModel(paymentDetailsFilters);

        // Assert
        expect(result).toEqual({
          ...paymentDetailsFilters,
          paymentCurrency: mapCurrenciesToRadioItems(),
        });
      });
    });
  });
});
