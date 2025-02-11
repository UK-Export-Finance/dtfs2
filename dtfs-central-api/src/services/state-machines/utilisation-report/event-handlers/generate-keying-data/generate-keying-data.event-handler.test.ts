import { EntityManager } from 'typeorm';
import {
  UtilisationReportEntityMockBuilder,
  DbRequestSource,
  FeeRecordEntityMockBuilder,
  UtilisationReportEntity,
  UtilisationReportStatus,
  FeeRecordPaymentJoinTableEntity,
  FEE_RECORD_STATUS,
  REQUEST_PLATFORM_TYPE,
  RECONCILIATION_IN_PROGRESS,
  PENDING_RECONCILIATION,
} from '@ukef/dtfs2-common';
import { handleUtilisationReportGenerateKeyingDataEvent } from './generate-keying-data.event-handler';
import { FeeRecordStateMachine } from '../../../fee-record/fee-record.state-machine';
import { getKeyingSheetFeePaymentSharesForFeeRecords } from '../helpers';

jest.mock('../helpers');

describe('handleUtilisationReportGenerateKeyingDataEvent', () => {
  const tfmUserId = 'abc123';
  const requestSource: DbRequestSource = {
    platform: REQUEST_PLATFORM_TYPE.TFM,
    userId: tfmUserId,
  };

  const mockSave = jest.fn();
  const mockUpdate = jest.fn();

  const mockEntityManager = {
    save: mockSave,
    update: mockUpdate,
  } as unknown as EntityManager;

  const aReconciliationInProgressReport = () => UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).build();

  const aMockEventHandler = () => jest.fn();
  const aMockFeeRecordStateMachine = (eventHandler: jest.Mock): FeeRecordStateMachine =>
    ({
      handleEvent: eventHandler,
    }) as unknown as FeeRecordStateMachine;

  beforeEach(() => {
    jest.spyOn(FeeRecordStateMachine, 'forFeeRecord').mockReturnValue(aMockFeeRecordStateMachine(aMockEventHandler()));
    jest.mocked(getKeyingSheetFeePaymentSharesForFeeRecords).mockReturnValue([]);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('updates each fee record in the payload and updates the fee record payment join table', async () => {
    // Arrange
    const utilisationReport = aReconciliationInProgressReport();
    const feeRecords = [
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withStatus(FEE_RECORD_STATUS.MATCH).withId(1).build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withStatus(FEE_RECORD_STATUS.MATCH).withId(2).build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withStatus(FEE_RECORD_STATUS.MATCH).withId(3).build(),
    ];
    const eventHandlers = feeRecords.reduce((obj, { id }) => ({ ...obj, [id]: aMockEventHandler() }), {} as { [id: number]: jest.Mock });
    const feeRecordStateMachines = feeRecords.reduce(
      (stateMachines, { id }) => ({ ...stateMachines, [id]: aMockFeeRecordStateMachine(eventHandlers[id]) }),
      {} as { [id: number]: FeeRecordStateMachine },
    );

    jest.spyOn(FeeRecordStateMachine, 'forFeeRecord').mockImplementation((feeRecord) => feeRecordStateMachines[feeRecord.id]);
    mockUpdate.mockResolvedValue({});

    jest.mocked(getKeyingSheetFeePaymentSharesForFeeRecords).mockReturnValue([{ feeRecordId: 12, paymentId: 24, feePaymentAmount: 1000 }]);

    // Act
    await handleUtilisationReportGenerateKeyingDataEvent(utilisationReport, {
      transactionEntityManager: mockEntityManager,
      feeRecordsAtMatchStatusWithPayments: feeRecords,
      requestSource,
    });

    // Assert
    feeRecords.forEach(({ id }) => {
      const eventHandler = eventHandlers[id];
      expect(eventHandler).toHaveBeenCalledWith({
        type: 'GENERATE_KEYING_DATA',
        payload: {
          transactionEntityManager: mockEntityManager,
          isFinalFeeRecordForFacility: true,
          reportPeriod: utilisationReport.reportPeriod,
          requestSource,
        },
      });
    });

    expect(mockUpdate).toHaveBeenCalledWith(FeeRecordPaymentJoinTableEntity, { feeRecordId: 12, paymentId: 24 }, { paymentAmountUsedForFeeRecord: 1000 });
  });

  it('updates and saves the updated report', async () => {
    // Arrange
    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).build();

    // Act
    await handleUtilisationReportGenerateKeyingDataEvent(utilisationReport, {
      transactionEntityManager: mockEntityManager,
      feeRecordsAtMatchStatusWithPayments: [],
      requestSource,
    });

    // Assert
    expect(mockSave).toHaveBeenCalledWith(UtilisationReportEntity, utilisationReport);
    expect(utilisationReport.lastUpdatedByIsSystemUser).toEqual(false);
    expect(utilisationReport.lastUpdatedByPortalUserId).toBeNull();
    expect(utilisationReport.lastUpdatedByTfmUserId).toEqual(tfmUserId);
  });

  it('updates and saves the report setting status to RECONCILIATION_IN_PROGRESS when the status is PENDING_RECONCILIATION', async () => {
    // Arrange
    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).build();

    // Act
    await handleUtilisationReportGenerateKeyingDataEvent(utilisationReport, {
      transactionEntityManager: mockEntityManager,
      feeRecordsAtMatchStatusWithPayments: [],
      requestSource,
    });

    // Assert
    expect(mockSave).toHaveBeenCalledWith(UtilisationReportEntity, utilisationReport);
    expect(utilisationReport.status).toBe<UtilisationReportStatus>(RECONCILIATION_IN_PROGRESS);
    expect(utilisationReport.lastUpdatedByIsSystemUser).toEqual(false);
    expect(utilisationReport.lastUpdatedByPortalUserId).toBeNull();
    expect(utilisationReport.lastUpdatedByTfmUserId).toEqual(tfmUserId);
  });
});
