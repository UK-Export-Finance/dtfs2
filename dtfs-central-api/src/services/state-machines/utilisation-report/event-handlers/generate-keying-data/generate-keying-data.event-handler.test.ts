import { EntityManager, In } from 'typeorm';
import { UtilisationReportEntityMockBuilder, DbRequestSource, FeeRecordEntityMockBuilder, UtilisationReportEntity, FeeRecordEntity } from '@ukef/dtfs2-common';
import { handleUtilisationReportGenerateKeyingDataEvent } from './generate-keying-data.event-handler';
import { FeeRecordStateMachine } from '../../../fee-record/fee-record.state-machine';

describe('handleUtilisationReportGenerateKeyingDataEvent', () => {
  const tfmUserId = 'abc123';
  const requestSource: DbRequestSource = {
    platform: 'TFM',
    userId: tfmUserId,
  };

  const mockSave = jest.fn();
  const mockFind = jest.fn();
  const mockEntityManager = {
    save: mockSave,
    find: mockFind,
  } as unknown as EntityManager;

  const aReconciliationInProgressReport = () => UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();

  const aMatchedFeeRecordForReportWithFacilityId = (report: UtilisationReportEntity, facilityId: string) =>
    FeeRecordEntityMockBuilder.forReport(report).withStatus('MATCH').withFacilityId(facilityId).build();

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

  it('updates each fee record in the payload and calculates the keying data columns when all the supplied fee records have a unique facility id', async () => {
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

    // Act
    await handleUtilisationReportGenerateKeyingDataEvent(utilisationReport, {
      transactionEntityManager: mockEntityManager,
      feeRecordsAtMatchStatus: feeRecords,
      requestSource,
    });

    // Assert
    expect(mockFind).toHaveBeenCalledWith(FeeRecordEntity, {
      where: {
        report: { id: utilisationReport.id },
        status: In(['TO_DO', 'DOES_NOT_MATCH']),
      },
    });

    feeRecords.forEach(({ id }) => {
      const eventHandler = eventHandlers[id];
      expect(eventHandler).toHaveBeenCalledWith({
        type: 'GENERATE_KEYING_DATA',
        payload: {
          transactionEntityManager: mockEntityManager,
          isFinalFeeRecordForFacility: true,
          requestSource,
        },
      });
    });
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
        feeRecordsAtMatchStatus: feeRecords,
        requestSource,
      });

      // Assert
      expect(mockFind).toHaveBeenCalledWith(FeeRecordEntity, {
        where: {
          report: { id: utilisationReport.id },
          status: In(['TO_DO', 'DOES_NOT_MATCH']),
        },
      });

      const [firstFeeRecord, ...otherFeeRecords] = feeRecords;

      expect(eventHandlers[firstFeeRecord.id]).toHaveBeenCalledWith({
        type: 'GENERATE_KEYING_DATA',
        payload: {
          transactionEntityManager: mockEntityManager,
          isFinalFeeRecordForFacility: true,
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

      const toDoFeeRecordWithSameFacilityId = FeeRecordEntityMockBuilder.forReport(utilisationReport).withStatus('TO_DO').withFacilityId(facilityId).build();
      mockFind.mockResolvedValue([toDoFeeRecordWithSameFacilityId]);

      // Act
      await handleUtilisationReportGenerateKeyingDataEvent(utilisationReport, {
        transactionEntityManager: mockEntityManager,
        feeRecordsAtMatchStatus: feeRecords,
        requestSource,
      });

      // Assert
      expect(mockFind).toHaveBeenCalledWith(FeeRecordEntity, {
        where: {
          report: { id: utilisationReport.id },
          status: In(['TO_DO', 'DOES_NOT_MATCH']),
        },
      });

      feeRecords.forEach(({ id }) => {
        const eventHandler = eventHandlers[id];
        expect(eventHandler).toHaveBeenCalledWith({
          type: 'GENERATE_KEYING_DATA',
          payload: {
            transactionEntityManager: mockEntityManager,
            isFinalFeeRecordForFacility: false,
            requestSource,
          },
        });
      });
    });
  });

  it('updates and saves the updated report', async () => {
    // Arrange
    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

    mockFind.mockResolvedValue([]);

    // Act
    await handleUtilisationReportGenerateKeyingDataEvent(utilisationReport, {
      transactionEntityManager: mockEntityManager,
      feeRecordsAtMatchStatus: [],
      requestSource,
    });

    // Assert
    expect(mockSave).toHaveBeenCalledWith(UtilisationReportEntity, utilisationReport);
    expect(utilisationReport.lastUpdatedByIsSystemUser).toBe(false);
    expect(utilisationReport.lastUpdatedByPortalUserId).toBeNull();
    expect(utilisationReport.lastUpdatedByTfmUserId).toBe(tfmUserId);
  });
});
