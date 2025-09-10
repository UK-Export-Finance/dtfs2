import { FeeRecordEntityMockBuilder } from "@ukef/dtfs2-common/test-helpers";
import { EntityManager } from 'typeorm';
import { DbRequestSource, FEE_RECORD_STATUS, FeeRecordEntity, REQUEST_PLATFORM_TYPE } from '@ukef/dtfs2-common';
import { handleFeeRecordGenerateKeyingDataEvent } from './generate-keying-data.event-handler';

describe('handleFeeRecordGenerateKeyingDataEvent', () => {
  const mockSave = jest.fn();

  const mockEntityManager = {
    save: mockSave,
  } as unknown as EntityManager;

  const userId = 'abc123';

  const requestSource: DbRequestSource = {
    platform: REQUEST_PLATFORM_TYPE.TFM,
    userId,
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('saves the updated fee record with the supplied entity manager', async () => {
    // Arrange
    const feeRecord = new FeeRecordEntityMockBuilder().withStatus(FEE_RECORD_STATUS.MATCH).build();

    // Act
    await handleFeeRecordGenerateKeyingDataEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      requestSource,
    });

    // Assert
    expect(mockSave).toHaveBeenCalledWith(FeeRecordEntity, feeRecord);
  });

  it(`updates the fee record status to '${FEE_RECORD_STATUS.READY_TO_KEY}' if fees paid to ukef is greater than zero`, async () => {
    // Arrange
    const feeRecord = new FeeRecordEntityMockBuilder().withStatus(FEE_RECORD_STATUS.MATCH).withFeesPaidToUkefForThePeriod(0.01).build();

    // Act
    await handleFeeRecordGenerateKeyingDataEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      requestSource,
    });

    // Assert
    expect(feeRecord.status).toEqual(FEE_RECORD_STATUS.READY_TO_KEY);
  });

  it(`updates the fee record status to '${FEE_RECORD_STATUS.RECONCILED}' if fees paid to ukef is equal to zero`, async () => {
    // Arrange
    const feeRecord = new FeeRecordEntityMockBuilder().withStatus(FEE_RECORD_STATUS.MATCH).withFeesPaidToUkefForThePeriod(0).build();

    // Act
    await handleFeeRecordGenerateKeyingDataEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      requestSource,
    });

    // Assert
    expect(feeRecord.status).toEqual(FEE_RECORD_STATUS.RECONCILED);
  });

  it("sets the fee record 'lastUpdatedByIsSystemUser' field to false", async () => {
    // Arrange
    const feeRecord = new FeeRecordEntityMockBuilder().withStatus(FEE_RECORD_STATUS.MATCH).build();

    // Act
    await handleFeeRecordGenerateKeyingDataEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      requestSource,
    });

    // Assert
    expect(feeRecord.lastUpdatedByIsSystemUser).toEqual(false);
  });

  it("sets the fee record 'lastUpdatedByPortalUserId' to null", async () => {
    // Arrange
    const feeRecord = new FeeRecordEntityMockBuilder().withStatus(FEE_RECORD_STATUS.MATCH).build();

    // Act
    await handleFeeRecordGenerateKeyingDataEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      requestSource,
    });

    // Assert
    expect(feeRecord.lastUpdatedByPortalUserId).toBeNull();
  });

  it("sets the fee record 'lastUpdatedByTfmUserId' to the request source user id", async () => {
    // Arrange
    const feeRecord = new FeeRecordEntityMockBuilder().withStatus(FEE_RECORD_STATUS.MATCH).build();

    // Act
    await handleFeeRecordGenerateKeyingDataEvent(feeRecord, {
      transactionEntityManager: mockEntityManager,
      requestSource,
    });

    // Assert
    expect(feeRecord.lastUpdatedByTfmUserId).toEqual(userId);
  });
});
