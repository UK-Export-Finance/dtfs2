import { EntityManager } from 'typeorm';
import {
  Currency,
  DbRequestSource,
  FeeRecordEntity,
  FeeRecordEntityMockBuilder,
  FeeRecordStatus,
  PaymentEntity,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UtilisationReportEntity,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { handleUtilisationReportAddAPaymentEvent } from './add-a-payment.event-handler';
import { NewPaymentDetails } from '../../../../../types/utilisation-reports';
import { FeeRecordStateMachine } from '../../../fee-record/fee-record.state-machine';
import { feeRecordsMatchAttachedPayments } from './helpers';

jest.mock('./helpers');

describe('handleUtilisationReportAddAPaymentEvent', () => {
  const tfmUserId = 'abc123';
  const requestSource: DbRequestSource = {
    platform: 'TFM',
    userId: tfmUserId,
  };

  const mockEntityManager = {
    save: jest.fn(),
  } as unknown as EntityManager;

  const paymentCurrency: Currency = 'GBP';
  const paymentDetails: NewPaymentDetails = {
    currency: paymentCurrency,
    amountReceived: 100,
    dateReceived: new Date(),
    paymentReference: 'A payment reference',
  };

  const aListOfFeeRecordsForReport = (report: UtilisationReportEntity): FeeRecordEntity[] => [
    FeeRecordEntityMockBuilder.forReport(report).withId(1).withPaymentCurrency(paymentCurrency).build(),
    FeeRecordEntityMockBuilder.forReport(report).withId(2).withPaymentCurrency(paymentCurrency).build(),
  ];

  const getFeeRecordStateMachinesForFeeRecords = (feeRecords: FeeRecordEntity[]) =>
    feeRecords.map((feeRecord) => FeeRecordStateMachine.forFeeRecord(feeRecord));

  const getEventHandlerSpiesForFeeRecordStateMachines = (feeRecordStateMachines: FeeRecordStateMachine[], feeRecords: FeeRecordEntity[]) =>
    feeRecordStateMachines.map((stateMachine, index) => jest.spyOn(stateMachine, 'handleEvent').mockResolvedValue(feeRecords[index]));

  const mockFeeRecordStateMachineConstructorImplementation = (feeRecords: FeeRecordEntity[], feeRecordStateMachines: FeeRecordStateMachine[]) => {
    jest.spyOn(FeeRecordStateMachine, 'forFeeRecord').mockImplementation((feeRecord) => {
      const indexOfMatchingFeeRecord = feeRecords.findIndex(({ id }) => id === feeRecord.id);
      if (indexOfMatchingFeeRecord === -1) {
        throw new Error('Failed to find fee record with matching id');
      }
      return feeRecordStateMachines[indexOfMatchingFeeRecord];
    });
  };

  beforeEach(() => {
    jest.mocked(feeRecordsMatchAttachedPayments).mockResolvedValue(false);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('creates and saves the new payment entity using the supplied entity manager', async () => {
    // Arrange
    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

    const feeRecords = aListOfFeeRecordsForReport(utilisationReport);
    const feeRecordStateMatchines = getFeeRecordStateMachinesForFeeRecords(feeRecords);
    mockFeeRecordStateMachineConstructorImplementation(feeRecords, feeRecordStateMatchines);

    const newPaymentEntity = PaymentEntity.create({
      ...paymentDetails,
      feeRecords,
      requestSource,
    });

    // Act
    await handleUtilisationReportAddAPaymentEvent(utilisationReport, {
      transactionEntityManager: mockEntityManager,
      feeRecords,
      paymentDetails,
      requestSource,
    });

    // Assert
    expect(mockEntityManager.save).toHaveBeenCalledWith(PaymentEntity, newPaymentEntity);
  });

  it("calls the 'feeRecordsMatchAttachedPayments' function with the supplied fee records and the new payment", async () => {
    // Arrange
    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

    const feeRecords = aListOfFeeRecordsForReport(utilisationReport);
    const feeRecordStateMatchines = getFeeRecordStateMachinesForFeeRecords(feeRecords);
    mockFeeRecordStateMachineConstructorImplementation(feeRecords, feeRecordStateMatchines);

    // Act
    await handleUtilisationReportAddAPaymentEvent(utilisationReport, {
      transactionEntityManager: mockEntityManager,
      feeRecords,
      paymentDetails,
      requestSource,
    });

    // Assert
    expect(feeRecordsMatchAttachedPayments).toHaveBeenCalledWith(feeRecords, mockEntityManager);
  });

  it("calls the fee record state machine 'PAYMENT_ADDED' event for each fee record in the payload", async () => {
    // Arrange
    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

    const feeRecords = aListOfFeeRecordsForReport(utilisationReport);
    const feeRecordStateMatchines = getFeeRecordStateMachinesForFeeRecords(feeRecords);
    mockFeeRecordStateMachineConstructorImplementation(feeRecords, feeRecordStateMatchines);

    const eventHandlerSpies = getEventHandlerSpiesForFeeRecordStateMachines(feeRecordStateMatchines, feeRecords);

    // Act
    await handleUtilisationReportAddAPaymentEvent(utilisationReport, {
      transactionEntityManager: mockEntityManager,
      feeRecords,
      paymentDetails,
      requestSource,
    });

    // Assert
    eventHandlerSpies.forEach((eventHandlerSpy) => {
      expect(eventHandlerSpy).toHaveBeenCalledWith({
        type: 'PAYMENT_ADDED',
        payload: {
          transactionEntityManager: mockEntityManager,
          status: 'DOES_NOT_MATCH',
          requestSource,
        },
      });
    });
  });

  it("calls the 'PAYMENT_ADDED' fee record event handler with the status set to 'MATCH' if 'feeRecordsMatchAttachedPayments' returns true", async () => {
    // Arrange
    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

    const feeRecords = aListOfFeeRecordsForReport(utilisationReport);
    const feeRecordStateMatchines = getFeeRecordStateMachinesForFeeRecords(feeRecords);
    mockFeeRecordStateMachineConstructorImplementation(feeRecords, feeRecordStateMatchines);

    const eventHandlerSpies = getEventHandlerSpiesForFeeRecordStateMachines(feeRecordStateMatchines, feeRecords);

    jest.mocked(feeRecordsMatchAttachedPayments).mockResolvedValue(true);
    const newStatus: FeeRecordStatus = 'MATCH';

    // Act
    await handleUtilisationReportAddAPaymentEvent(utilisationReport, {
      transactionEntityManager: mockEntityManager,
      feeRecords,
      paymentDetails,
      requestSource,
    });

    // Assert
    eventHandlerSpies.forEach((eventHandlerSpy) => {
      expect(eventHandlerSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'PAYMENT_ADDED',
          payload: expect.objectContaining({
            status: newStatus,
          }),
        }),
      );
    });
  });

  it("calls the 'PAYMENT_ADDED' fee record event handler with the status set to 'DOES_NOT_MATCH' if 'feeRecordsMatchAttachedPayments' returns true", async () => {
    // Arrange
    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

    const feeRecords = aListOfFeeRecordsForReport(utilisationReport);
    const feeRecordStateMatchines = getFeeRecordStateMachinesForFeeRecords(feeRecords);
    mockFeeRecordStateMachineConstructorImplementation(feeRecords, feeRecordStateMatchines);

    const eventHandlerSpies = getEventHandlerSpiesForFeeRecordStateMachines(feeRecordStateMatchines, feeRecords);

    jest.mocked(feeRecordsMatchAttachedPayments).mockResolvedValue(false);
    const newStatus: FeeRecordStatus = 'DOES_NOT_MATCH';

    // Act
    await handleUtilisationReportAddAPaymentEvent(utilisationReport, {
      transactionEntityManager: mockEntityManager,
      feeRecords,
      paymentDetails,
      requestSource,
    });

    // Assert
    eventHandlerSpies.forEach((eventHandlerSpy) => {
      expect(eventHandlerSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'PAYMENT_ADDED',
          payload: expect.objectContaining({
            status: newStatus,
          }),
        }),
      );
    });
  });

  it('saves the updated report', async () => {
    // Arrange
    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

    const feeRecords = aListOfFeeRecordsForReport(utilisationReport);
    const feeRecordStateMatchines = getFeeRecordStateMachinesForFeeRecords(feeRecords);
    mockFeeRecordStateMachineConstructorImplementation(feeRecords, feeRecordStateMatchines);

    // Act
    await handleUtilisationReportAddAPaymentEvent(utilisationReport, {
      transactionEntityManager: mockEntityManager,
      feeRecords,
      paymentDetails,
      requestSource,
    });

    // Assert
    expect(mockEntityManager.save).toHaveBeenCalledWith(UtilisationReportEntity, utilisationReport);
  });

  it(`only updates the report audit fields if the report status is '${UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_IN_PROGRESS}'`, async () => {
    // Arrange
    const reconciliationInProgressReport = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();

    const feeRecords = aListOfFeeRecordsForReport(reconciliationInProgressReport);
    const feeRecordStateMatchines = getFeeRecordStateMachinesForFeeRecords(feeRecords);
    mockFeeRecordStateMachineConstructorImplementation(feeRecords, feeRecordStateMatchines);

    // Act
    await handleUtilisationReportAddAPaymentEvent(reconciliationInProgressReport, {
      transactionEntityManager: mockEntityManager,
      feeRecords,
      paymentDetails,
      requestSource,
    });

    // Assert
    expect(reconciliationInProgressReport.lastUpdatedByIsSystemUser).toBe(false);
    expect(reconciliationInProgressReport.lastUpdatedByPortalUserId).toBeNull();
    expect(reconciliationInProgressReport.lastUpdatedByTfmUserId).toBe(tfmUserId);
  });

  it(`updates the report audit fields and status if the report status is '${UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION}'`, async () => {
    // Arrange
    const pendingReconciliationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

    const feeRecords = aListOfFeeRecordsForReport(pendingReconciliationReport);
    const feeRecordStateMatchines = getFeeRecordStateMachinesForFeeRecords(feeRecords);
    mockFeeRecordStateMachineConstructorImplementation(feeRecords, feeRecordStateMatchines);

    // Act
    await handleUtilisationReportAddAPaymentEvent(pendingReconciliationReport, {
      transactionEntityManager: mockEntityManager,
      feeRecords,
      paymentDetails,
      requestSource,
    });

    // Assert
    expect(pendingReconciliationReport.lastUpdatedByIsSystemUser).toBe(false);
    expect(pendingReconciliationReport.lastUpdatedByPortalUserId).toBeNull();
    expect(pendingReconciliationReport.lastUpdatedByTfmUserId).toBe(tfmUserId);
    expect(pendingReconciliationReport.status).toBe(UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_IN_PROGRESS);
  });
});
