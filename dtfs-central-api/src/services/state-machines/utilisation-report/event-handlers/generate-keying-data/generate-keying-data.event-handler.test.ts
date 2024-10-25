import { EntityManager, In } from 'typeorm';
import {
  UtilisationReportEntityMockBuilder,
  DbRequestSource,
  FeeRecordEntityMockBuilder,
  UtilisationReportEntity,
  FeeRecordEntity,
  UtilisationReportReconciliationStatus,
  FeeRecordPaymentJoinTableEntity,
  FEE_RECORD_STATUS,
} from '@ukef/dtfs2-common';
import { handleUtilisationReportGenerateKeyingDataEvent } from './generate-keying-data.event-handler';
import { FeeRecordStateMachine } from '../../../fee-record/fee-record.state-machine';
import { getKeyingSheetFeePaymentSharesForFeeRecords } from '../helpers';

jest.mock('../helpers');

describe('handleUtilisationReportGenerateKeyingDataEvent', () => {
  const tfmUserId = 'abc123';
  const requestSource: DbRequestSource = {
    platform: 'TFM',
    userId: tfmUserId,
  };

  const mockSave = jest.fn();
  const mockFind = jest.fn();
  const mockUpdate = jest.fn();
  const mockEntityManager = {
    save: mockSave,
    find: mockFind,
    update: mockUpdate,
  } as unknown as EntityManager;

  const aReconciliationInProgressReport = () => UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();

  const aMatchedFeeRecordForReportWithFacilityId = (report: UtilisationReportEntity, facilityId: string) =>
    FeeRecordEntityMockBuilder.forReport(report).withStatus(FEE_RECORD_STATUS.MATCH).withFacilityId(facilityId).build();

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

  it('updates each fee record in the payload, calculates the keying data columns when all the supplied fee records have a unique facility id and updates the fee record payment join table', async () => {
    // Arrange
    const utilisationReport = aReconciliationInProgressReport();
    const feeRecords = [
      aMatchedFeeRecordForReportWithFacilityId(utilisationReport, '11111111'),
      aMatchedFeeRecordForReportWithFacilityId(utilisationReport, '22222222'),
      aMatchedFeeRecordForReportWithFacilityId(utilisationReport, '33333333'),
    ];
    const eventHandlers = feeRecords.reduce((obj, { id }) => ({ ...obj, [id]: aMockEventHandler() }), {} as { [id: number]: jest.Mock });
    const feeRecordStateMachines = feeRecords.reduce(
      (stateMachines, { id }) => ({ ...stateMachines, [id]: aMockFeeRecordStateMachine(eventHandlers[id]) }),
      {} as { [id: number]: FeeRecordStateMachine },
    );

    jest.spyOn(FeeRecordStateMachine, 'forFeeRecord').mockImplementation((feeRecord) => feeRecordStateMachines[feeRecord.id]);
    mockFind.mockResolvedValue([]);
    mockUpdate.mockResolvedValue({});

    jest.mocked(getKeyingSheetFeePaymentSharesForFeeRecords).mockReturnValue([{ feeRecordId: 12, paymentId: 24, feePaymentAmount: 1000 }]);

    // Act
    await handleUtilisationReportGenerateKeyingDataEvent(utilisationReport, {
      transactionEntityManager: mockEntityManager,
      feeRecordsAtMatchStatusWithPayments: feeRecords,
      requestSource,
    });

    // Assert
    expect(mockFind).toHaveBeenCalledWith(FeeRecordEntity, {
      where: {
        report: { id: utilisationReport.id },
        status: In([FEE_RECORD_STATUS.TO_DO, FEE_RECORD_STATUS.DOES_NOT_MATCH]),
      },
    });

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

  describe('when there are multiple fee records with the same facility id', () => {
    const facilityId = '12345678';

    it('calculates keying data for only one of the fee records in the payload with that facility id', async () => {
      // Arrange
      const utilisationReport = aReconciliationInProgressReport();
      const feeRecords = [
        aMatchedFeeRecordForReportWithFacilityId(utilisationReport, facilityId),
        aMatchedFeeRecordForReportWithFacilityId(utilisationReport, facilityId),
        aMatchedFeeRecordForReportWithFacilityId(utilisationReport, facilityId),
      ];
      const eventHandlers = feeRecords.reduce((obj, { id }) => ({ ...obj, [id]: aMockEventHandler() }), {} as { [id: number]: jest.Mock });
      const feeRecordStateMachines = feeRecords.reduce(
        (stateMachines, { id }) => ({ ...stateMachines, [id]: aMockFeeRecordStateMachine(eventHandlers[id]) }),
        {} as { [id: number]: FeeRecordStateMachine },
      );

      jest.spyOn(FeeRecordStateMachine, 'forFeeRecord').mockImplementation((feeRecord) => feeRecordStateMachines[feeRecord.id]);
      mockFind.mockResolvedValue([]);

      // Act
      await handleUtilisationReportGenerateKeyingDataEvent(utilisationReport, {
        transactionEntityManager: mockEntityManager,
        feeRecordsAtMatchStatusWithPayments: feeRecords,
        requestSource,
      });

      // Assert
      expect(mockFind).toHaveBeenCalledWith(FeeRecordEntity, {
        where: {
          report: { id: utilisationReport.id },
          status: In([FEE_RECORD_STATUS.TO_DO, FEE_RECORD_STATUS.DOES_NOT_MATCH]),
        },
      });

      const [firstFeeRecord, ...otherFeeRecords] = feeRecords;

      expect(eventHandlers[firstFeeRecord.id]).toHaveBeenCalledWith({
        type: 'GENERATE_KEYING_DATA',
        payload: {
          transactionEntityManager: mockEntityManager,
          isFinalFeeRecordForFacility: true,
          reportPeriod: utilisationReport.reportPeriod,
          requestSource,
        },
      });

      otherFeeRecords.forEach(({ id }) => {
        const eventHandler = eventHandlers[id];
        expect(eventHandler).toHaveBeenCalledWith({
          type: 'GENERATE_KEYING_DATA',
          payload: {
            transactionEntityManager: mockEntityManager,
            isFinalFeeRecordForFacility: false,
            reportPeriod: utilisationReport.reportPeriod,
            requestSource,
          },
        });
      });
    });

    it('does not calculate keying data for any fee record when a fee record at the TO_DO state with the same facility id exists', async () => {
      // Arrange
      const utilisationReport = aReconciliationInProgressReport();
      const feeRecords = [
        aMatchedFeeRecordForReportWithFacilityId(utilisationReport, facilityId),
        aMatchedFeeRecordForReportWithFacilityId(utilisationReport, facilityId),
        aMatchedFeeRecordForReportWithFacilityId(utilisationReport, facilityId),
      ];
      const eventHandlers = feeRecords.reduce((obj, { id }) => ({ ...obj, [id]: aMockEventHandler() }), {} as { [id: number]: jest.Mock });
      const feeRecordStateMachines = feeRecords.reduce(
        (stateMachines, { id }) => ({ ...stateMachines, [id]: aMockFeeRecordStateMachine(eventHandlers[id]) }),
        {} as { [id: number]: FeeRecordStateMachine },
      );

      jest.spyOn(FeeRecordStateMachine, 'forFeeRecord').mockImplementation((feeRecord) => feeRecordStateMachines[feeRecord.id]);

      const toDoFeeRecordWithSameFacilityId = FeeRecordEntityMockBuilder.forReport(utilisationReport)
        .withStatus(FEE_RECORD_STATUS.TO_DO)
        .withFacilityId(facilityId)
        .build();
      mockFind.mockResolvedValue([toDoFeeRecordWithSameFacilityId]);

      // Act
      await handleUtilisationReportGenerateKeyingDataEvent(utilisationReport, {
        transactionEntityManager: mockEntityManager,
        feeRecordsAtMatchStatusWithPayments: feeRecords,
        requestSource,
      });

      // Assert
      expect(mockFind).toHaveBeenCalledWith(FeeRecordEntity, {
        where: {
          report: { id: utilisationReport.id },
          status: In([FEE_RECORD_STATUS.TO_DO, FEE_RECORD_STATUS.DOES_NOT_MATCH]),
        },
      });

      feeRecords.forEach(({ id }) => {
        const eventHandler = eventHandlers[id];
        expect(eventHandler).toHaveBeenCalledWith({
          type: 'GENERATE_KEYING_DATA',
          payload: {
            transactionEntityManager: mockEntityManager,
            isFinalFeeRecordForFacility: false,
            reportPeriod: utilisationReport.reportPeriod,
            requestSource,
          },
        });
      });
    });
  });

  it('updates and saves the updated report', async () => {
    // Arrange
    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();

    mockFind.mockResolvedValue([]);

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
    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

    mockFind.mockResolvedValue([]);

    // Act
    await handleUtilisationReportGenerateKeyingDataEvent(utilisationReport, {
      transactionEntityManager: mockEntityManager,
      feeRecordsAtMatchStatusWithPayments: [],
      requestSource,
    });

    // Assert
    expect(mockSave).toHaveBeenCalledWith(UtilisationReportEntity, utilisationReport);
    expect(utilisationReport.status).toBe<UtilisationReportReconciliationStatus>('RECONCILIATION_IN_PROGRESS');
    expect(utilisationReport.lastUpdatedByIsSystemUser).toEqual(false);
    expect(utilisationReport.lastUpdatedByPortalUserId).toBeNull();
    expect(utilisationReport.lastUpdatedByTfmUserId).toEqual(tfmUserId);
  });
});
