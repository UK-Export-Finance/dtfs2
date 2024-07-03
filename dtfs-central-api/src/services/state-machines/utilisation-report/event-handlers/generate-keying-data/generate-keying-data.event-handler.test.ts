import { EntityManager } from 'typeorm';
import { UtilisationReportEntityMockBuilder, DbRequestSource, FeeRecordEntityMockBuilder, UtilisationReportEntity, FeeRecordEntity } from '@ukef/dtfs2-common';
import { handleUtilisationReportGenerateKeyingDataEvent } from './generate-keying-data.event-handler';
import { FeeRecordStateMachine } from '../../../fee-record/fee-record.state-machine';
import { GenerateKeyingDataDetails } from '../../../../../v1/controllers/utilisation-report-service/post-keying-data.controller/helpers';

describe('handleUtilisationReportGenerateKeyingDataEvent', () => {
  const tfmUserId = 'abc123';
  const requestSource: DbRequestSource = {
    platform: 'TFM',
    userId: tfmUserId,
  };

  const mockSave = jest.fn();
  const mockEntityManager = {
    save: mockSave,
  } as unknown as EntityManager;

  const aReconciliationInProgressReport = () => UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();

  const aListOfFeeRecordsForReport = (report: UtilisationReportEntity): FeeRecordEntity[] => [
    FeeRecordEntityMockBuilder.forReport(report).withId(1).withPaymentCurrency('GBP').build(),
    FeeRecordEntityMockBuilder.forReport(report).withId(2).withPaymentCurrency('GBP').build(),
  ];

  const aMockEventHandler = () => jest.fn();
  const aMockFeeRecordStateMachine = (eventHandler: jest.Mock): FeeRecordStateMachine =>
    ({
      handleEvent: eventHandler,
    }) as unknown as FeeRecordStateMachine;

  beforeEach(() => {
    jest.spyOn(FeeRecordStateMachine, 'forFeeRecord').mockReturnValue(aMockFeeRecordStateMachine(aMockEventHandler()));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('updates each fee record in the payload generateKeyingDataDetails', async () => {
    // Arrange
    const utilisationReport = aReconciliationInProgressReport();
    const feeRecords = aListOfFeeRecordsForReport(utilisationReport);
    const eventHandlers = feeRecords.reduce((obj, { id }) => ({ ...obj, [id]: aMockEventHandler() }), {} as { [id: number]: jest.Mock });
    const feeRecordStateMachines = feeRecords.reduce(
      (stateMachines, { id }) => ({ ...stateMachines, [id]: aMockFeeRecordStateMachine(eventHandlers[id]) }),
      {} as { [id: number]: FeeRecordStateMachine },
    );

    const generateKeyingDataDetails: GenerateKeyingDataDetails = feeRecords.map((feeRecord) => ({ feeRecord, isFacilityReadyToKey: false }));

    jest.spyOn(FeeRecordStateMachine, 'forFeeRecord').mockImplementation((feeRecord) => feeRecordStateMachines[feeRecord.id]);

    // Act
    await handleUtilisationReportGenerateKeyingDataEvent(utilisationReport, {
      transactionEntityManager: mockEntityManager,
      generateKeyingDataDetails,
      requestSource,
    });

    // Assert
    feeRecords.forEach(({ id }, index) => {
      const eventHandler = eventHandlers[id];
      const { isFacilityReadyToKey } = generateKeyingDataDetails[index];
      expect(eventHandler).toHaveBeenCalledWith({
        type: 'KEYING_DATA_GENERATED',
        payload: {
          transactionEntityManager: mockEntityManager,
          isFacilityReadyToKey,
          requestSource,
        },
      });
    });
  });

  it('updates and saves the updated report', async () => {
    // Arrange
    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

    // Act
    await handleUtilisationReportGenerateKeyingDataEvent(utilisationReport, {
      transactionEntityManager: mockEntityManager,
      generateKeyingDataDetails: [],
      requestSource,
    });

    // Assert
    expect(mockSave).toHaveBeenCalledWith(UtilisationReportEntity, utilisationReport);
    expect(utilisationReport.lastUpdatedByIsSystemUser).toBe(false);
    expect(utilisationReport.lastUpdatedByPortalUserId).toBeNull();
    expect(utilisationReport.lastUpdatedByTfmUserId).toBe(tfmUserId);
  });
});
