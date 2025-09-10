import { FeeRecordEntityMockBuilder } from "@ukef/dtfs2-common/test-helpers";
import { EntityManager } from 'typeorm';
import {
  DbRequestSource,
  FEE_RECORD_STATUS,
  FeeRecordCorrectionEntity,
  FeeRecordEntity,
  RECORD_CORRECTION_REASON,
  REQUEST_PLATFORM_TYPE,
} from '@ukef/dtfs2-common';
import { FeeRecordCorrectionRequestedEvent, handleFeeRecordCorrectionRequestedEvent } from './correction-requested.event-handler';
import { aDbRequestSource } from '../../../../../../test-helpers';

describe('handleFeeRecordCorrectionRequestedEvent', () => {
  const mockSave = jest.fn();
  const mockEntityManager = {
    save: mockSave,
  } as unknown as EntityManager;

  const requestedByUser = {
    id: 'aaa111',
    firstName: 'Test',
    lastName: 'User',
  };

  const bankTeamName = 'Payment Officer Team';
  const bankTeamEmails = ['test@ukexportfinance.gov.uk'];

  const aCorrectionRequestedEventPayload = (): FeeRecordCorrectionRequestedEvent['payload'] => ({
    transactionEntityManager: mockEntityManager,
    reasons: [RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT],
    additionalInfo: 'info',
    requestedByUser: {
      ...requestedByUser,
    },
    requestSource: aDbRequestSource(),
    bankTeamName,
    bankTeamEmails,
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should save the updated fee record with the supplied entity manager', async () => {
    // Arrange
    const feeRecord = new FeeRecordEntityMockBuilder().build();

    // Act
    await handleFeeRecordCorrectionRequestedEvent(feeRecord, {
      ...aCorrectionRequestedEventPayload(),
      transactionEntityManager: mockEntityManager,
    });

    // Assert
    expect(mockSave).toHaveBeenCalledWith(FeeRecordEntity, feeRecord);
  });

  it(`should set the fee record status ${FEE_RECORD_STATUS.PENDING_CORRECTION} `, async () => {
    // Arrange
    const feeRecord = new FeeRecordEntityMockBuilder().withStatus(FEE_RECORD_STATUS.TO_DO).build();

    // Act
    await handleFeeRecordCorrectionRequestedEvent(feeRecord, aCorrectionRequestedEventPayload());

    // Assert
    expect(feeRecord.status).toEqual(FEE_RECORD_STATUS.PENDING_CORRECTION);
  });

  it('should update the last updated by user fields using the db request source', async () => {
    // Arrange
    const feeRecord = new FeeRecordEntityMockBuilder()
      .withLastUpdatedByIsSystemUser(true)
      .withLastUpdatedByPortalUserId('123')
      .withLastUpdatedByTfmUserId(null)
      .build();

    const requestSource: DbRequestSource = {
      userId: 'abc123',
      platform: REQUEST_PLATFORM_TYPE.TFM,
    };

    // Act
    await handleFeeRecordCorrectionRequestedEvent(feeRecord, {
      ...aCorrectionRequestedEventPayload(),
      requestSource,
    });

    // Assert
    expect(feeRecord.lastUpdatedByIsSystemUser).toEqual(false);
    expect(feeRecord.lastUpdatedByTfmUserId).toEqual('abc123');
    expect(feeRecord.lastUpdatedByPortalUserId).toBeNull();
  });

  it('should create new correction for the fee record', async () => {
    // Arrange
    const feeRecord = new FeeRecordEntityMockBuilder().build();
    const requestSource: DbRequestSource = {
      userId: 'abc123',
      platform: REQUEST_PLATFORM_TYPE.TFM,
    };
    const reasons = [RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT];
    const additionalInfo = 'more information about the reason for record correction';

    // Act
    await handleFeeRecordCorrectionRequestedEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      reasons,
      additionalInfo,
      requestedByUser,
      requestSource,
      bankTeamName,
      bankTeamEmails,
    });

    // Assert
    const newCorrection = FeeRecordCorrectionEntity.createRequestedCorrection({
      feeRecord,
      requestedByUser,
      reasons,
      additionalInfo,
      requestSource,
      bankTeamName,
      bankTeamEmails,
    });
    expect(mockSave).toHaveBeenCalledWith(FeeRecordCorrectionEntity, newCorrection);
  });
});
