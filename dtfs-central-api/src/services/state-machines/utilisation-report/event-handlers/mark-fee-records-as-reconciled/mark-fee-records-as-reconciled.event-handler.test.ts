import { EntityManager } from 'typeorm';
import {
  DbRequestSource,
  FEE_RECORD_STATUS,
  FeeRecordEntityMockBuilder,
  UtilisationReportEntity,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { handleUtilisationReportMarkFeeRecordsAsReconciledEvent } from './mark-fee-records-as-reconciled.event-handler';
import { FeeRecordStateMachine } from '../../../fee-record/fee-record.state-machine';
import externalApi from '../../../../../external-api/api';
import { getBankById } from '../../../../../repositories/banks-repo';
import { aBank } from '../../../../../../test-helpers';

jest.mock('../../../../../repositories/banks-repo');
jest.mock('../../../../../external-api/api');

describe('handleUtilisationReportMarkFeeRecordsAsReconciledEvent', () => {
  const tfmUserId = 'abc123';
  const requestSource: DbRequestSource = {
    platform: 'TFM',
    userId: tfmUserId,
  };

  const mockSave = jest.fn();
  const mockFindOneOrFail = jest.fn();
  const mockEntityManager = {
    save: mockSave,
    findOneOrFail: mockFindOneOrFail,
  } as unknown as EntityManager;

  const aMockEventHandler = () => jest.fn().mockImplementation();
  const aMockFeeRecordStateMachine = (eventHandler: jest.Mock): FeeRecordStateMachine =>
    ({
      handleEvent: eventHandler,
    }) as unknown as FeeRecordStateMachine;

  let sendEmailSpy = jest.fn();
  const mockGetBankByIdResponse = aBank();

  beforeEach(() => {
    jest.spyOn(FeeRecordStateMachine, 'forFeeRecord').mockReturnValue(aMockFeeRecordStateMachine(aMockEventHandler()));
    mockFindOneOrFail.mockResolvedValue(UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').withFeeRecords([]).build());
    sendEmailSpy = jest.fn(() => Promise.resolve({}));
    externalApi.sendEmail = sendEmailSpy;
    jest.mocked(getBankById).mockImplementation(jest.fn().mockResolvedValue(mockGetBankByIdResponse));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('when every fee record has to be reconciled', () => {
    // Arrange
    const report = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();
    const feeRecordOne = FeeRecordEntityMockBuilder.forReport(report).withId(1).withStatus('READY_TO_KEY').build();
    const feeRecordTwo = FeeRecordEntityMockBuilder.forReport(report).withId(2).withStatus('READY_TO_KEY').build();

    const eventHandlerOne = aMockEventHandler();
    const eventHandlerTwo = aMockEventHandler();
    const feeRecordStateMachineOne = aMockFeeRecordStateMachine(eventHandlerOne);
    const feeRecordStateMachineTwo = aMockFeeRecordStateMachine(eventHandlerTwo);

    let feeRecordStateMachineConstructorSpy: jest.SpyInstance;

    beforeEach(async () => {
      feeRecordStateMachineConstructorSpy = jest.spyOn(FeeRecordStateMachine, 'forFeeRecord').mockImplementation((feeRecord) => {
        if (feeRecord.id === 1) {
          return feeRecordStateMachineOne;
        }
        if (feeRecord.id === 2) {
          return feeRecordStateMachineTwo;
        }
        return aMockFeeRecordStateMachine(aMockEventHandler());
      });

      // Act
      await handleUtilisationReportMarkFeeRecordsAsReconciledEvent(report, {
        requestSource,
        feeRecordsToReconcile: [feeRecordOne, feeRecordTwo],
        transactionEntityManager: mockEntityManager,
        reconciledByUserId: 'abc123',
      });
    });

    it('should call the fee record state machine with the MARK_AS_RECONCILED event for every fee record to reconcile', () => {
      // Assert
      expect(feeRecordStateMachineConstructorSpy).toHaveBeenCalledTimes(2);
      expect(eventHandlerOne).toHaveBeenCalledTimes(1);
      expect(eventHandlerOne).toHaveBeenCalledWith({
        type: 'MARK_AS_RECONCILED',
        payload: {
          transactionEntityManager: mockEntityManager,
          reconciledByUserId: 'abc123',
          requestSource,
        },
      });
      expect(eventHandlerTwo).toHaveBeenCalledTimes(1);
      expect(eventHandlerTwo).toHaveBeenCalledWith({
        type: 'MARK_AS_RECONCILED',
        payload: {
          transactionEntityManager: mockEntityManager,
          reconciledByUserId: 'abc123',
          requestSource,
        },
      });
    });

    it('should call externalApi.sendEmail once', () => {
      // Assert
      expect(sendEmailSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('when all fee records are reconciled', () => {
    // Arrange
    const report = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();
    const feeRecordOne = FeeRecordEntityMockBuilder.forReport(report).withId(1).withStatus('READY_TO_KEY').build();
    const feeRecordTwo = FeeRecordEntityMockBuilder.forReport(report).withId(2).withStatus('READY_TO_KEY').build();

    const reportWithUpdatedFeeRecords = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();
    const feeRecordOneUpdated = FeeRecordEntityMockBuilder.forReport(report).withId(1).withStatus(FEE_RECORD_STATUS.RECONCILED).build();
    const feeRecordTwoUpdated = FeeRecordEntityMockBuilder.forReport(report).withId(2).withStatus(FEE_RECORD_STATUS.RECONCILED).build();
    const feeRecordThreeUpdated = FeeRecordEntityMockBuilder.forReport(report).withId(3).withStatus(FEE_RECORD_STATUS.RECONCILED).build();
    reportWithUpdatedFeeRecords.feeRecords = [feeRecordOneUpdated, feeRecordTwoUpdated, feeRecordThreeUpdated];

    beforeEach(async () => {
      mockFindOneOrFail.mockResolvedValue(reportWithUpdatedFeeRecords);

      // Act
      await handleUtilisationReportMarkFeeRecordsAsReconciledEvent(report, {
        requestSource,
        feeRecordsToReconcile: [feeRecordOne, feeRecordTwo],
        transactionEntityManager: mockEntityManager,
        reconciledByUserId: 'abc123',
      });
    });

    it('should set the report status to RECONCILED', () => {
      // Assert
      expect(mockFindOneOrFail).toHaveBeenCalledWith(UtilisationReportEntity, { where: { id: report.id }, relations: { feeRecords: true } });
      expect(mockSave).toHaveBeenCalledWith(UtilisationReportEntity, report);
      expect(report).toEqual(
        expect.objectContaining<Partial<UtilisationReportEntity>>({
          status: 'RECONCILIATION_COMPLETED',
          lastUpdatedByTfmUserId: requestSource.userId,
          lastUpdatedByPortalUserId: null,
          lastUpdatedByIsSystemUser: false,
        }),
      );
    });

    it('should call externalApi.sendEmail once', () => {
      // Assert
      expect(sendEmailSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('when only some fee records are reconciled', () => {
    // Arrange
    const report = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();
    const feeRecordOne = FeeRecordEntityMockBuilder.forReport(report).withId(1).withStatus('READY_TO_KEY').build();
    const feeRecordTwo = FeeRecordEntityMockBuilder.forReport(report).withId(2).withStatus('READY_TO_KEY').build();

    const reportWithUpdatedFeeRecords = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();
    const feeRecordOneUpdated = FeeRecordEntityMockBuilder.forReport(report).withId(1).withStatus(FEE_RECORD_STATUS.RECONCILED).build();
    const feeRecordTwoUpdated = FeeRecordEntityMockBuilder.forReport(report).withId(2).withStatus(FEE_RECORD_STATUS.RECONCILED).build();
    const feeRecordThreeUpdated = FeeRecordEntityMockBuilder.forReport(report).withId(3).withStatus('READY_TO_KEY').build();
    reportWithUpdatedFeeRecords.feeRecords = [feeRecordOneUpdated, feeRecordTwoUpdated, feeRecordThreeUpdated];

    beforeEach(async () => {
      mockFindOneOrFail.mockResolvedValue(reportWithUpdatedFeeRecords);

      // Act
      await handleUtilisationReportMarkFeeRecordsAsReconciledEvent(report, {
        requestSource,
        feeRecordsToReconcile: [feeRecordOne, feeRecordTwo],
        transactionEntityManager: mockEntityManager,
        reconciledByUserId: 'abc123',
      });
    });

    it('should not set report status to RECONCILED if not all fee records are now reconciled', () => {
      // Assert
      expect(mockFindOneOrFail).toHaveBeenCalledWith(UtilisationReportEntity, { where: { id: report.id }, relations: { feeRecords: true } });
      expect(mockSave).not.toHaveBeenCalled();
      expect(report).toEqual(
        expect.objectContaining<Partial<UtilisationReportEntity>>({
          status: 'RECONCILIATION_IN_PROGRESS',
        }),
      );
    });

    it('should NOT call externalApi.sendEmail', () => {
      // Assert
      expect(sendEmailSpy).toHaveBeenCalledTimes(0);
    });
  });
});
