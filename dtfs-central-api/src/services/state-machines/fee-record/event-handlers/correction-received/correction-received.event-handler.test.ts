import { EntityManager } from 'typeorm';
import {
  CURRENCY,
  FEE_RECORD_STATUS,
  FeeRecordCorrectionEntity,
  FeeRecordCorrectionEntityMockBuilder,
  FeeRecordEntity,
  FeeRecordEntityMockBuilder,
  RECORD_CORRECTION_REASON,
  RecordCorrectionTransientFormData,
} from '@ukef/dtfs2-common';
import { CorrectionReceivedEventPayload, handleFeeRecordCorrectionReceivedEvent } from './correction-received.event-handler';
import { aDbRequestSource } from '../../../../../../test-helpers';

describe('handleFeeRecordCorrectionReceivedEvent', () => {
  const mockSave = jest.fn();
  const mockEntityManager = {
    save: mockSave,
  } as unknown as EntityManager;

  const aCorrectionReceivedEventPayload = (): CorrectionReceivedEventPayload => ({
    transactionEntityManager: mockEntityManager,
    requestSource: aDbRequestSource(),
    correctionEntity: FeeRecordCorrectionEntityMockBuilder.forIsCompleted(false).withReasons([RECORD_CORRECTION_REASON.OTHER]).build(),
    correctionFormData: { additionalComments: 'Some additional comments' },
  });

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should save the updated fee record with the supplied entity manager', async () => {
    // Arrange
    const feeRecord = new FeeRecordEntityMockBuilder().build();

    // Act
    await handleFeeRecordCorrectionReceivedEvent(feeRecord, {
      ...aCorrectionReceivedEventPayload(),
      transactionEntityManager: mockEntityManager,
    });

    // Assert
    expect(mockSave).toHaveBeenCalledWith(FeeRecordEntity, feeRecord);
  });

  it('should save the updated correction with the supplied entity manager', async () => {
    // Arrange
    const feeRecord = new FeeRecordEntityMockBuilder().build();

    const payload = {
      ...aCorrectionReceivedEventPayload(),
      transactionEntityManager: mockEntityManager,
      correctionEntity: FeeRecordCorrectionEntityMockBuilder.forIsCompleted(false).withReasons([RECORD_CORRECTION_REASON.OTHER]).build(),
    };

    // Act
    await handleFeeRecordCorrectionReceivedEvent(feeRecord, payload);

    // Assert
    expect(mockSave).toHaveBeenCalledWith(FeeRecordCorrectionEntity, payload.correctionEntity);
  });

  it('should extract the previous values for the fields being corrected from the fee record and save them on the correction', async () => {
    // Arrange
    const feeRecord = new FeeRecordEntityMockBuilder()
      .withFeesPaidToUkefForThePeriod(300)
      .withFeesPaidToUkefForThePeriodCurrency(CURRENCY.GBP)
      .withFacilityId('11111111')
      .withFacilityUtilisation(20000)
      .build();

    const reasons = [RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT, RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT];

    const correctionEntity = FeeRecordCorrectionEntityMockBuilder.forIsCompleted(false).withReasons(reasons).build();

    // Act
    await handleFeeRecordCorrectionReceivedEvent(feeRecord, { ...aCorrectionReceivedEventPayload(), correctionEntity });

    // Assert
    expect(correctionEntity.previousValues).toEqual({
      feesPaidToUkefForThePeriod: 300,
      feesPaidToUkefForThePeriodCurrency: CURRENCY.GBP,
      facilityId: null,
      facilityUtilisation: null,
    });
  });

  it('should extract the corrected values for the fields being corrected from the form data and save them on the correction', async () => {
    // Arrange
    const feeRecord = new FeeRecordEntityMockBuilder().withFeesPaidToUkefForThePeriod(500).withFeesPaidToUkefForThePeriodCurrency(CURRENCY.JPY).build();

    const correctionFormData: RecordCorrectionTransientFormData = {
      reportedFee: 400,
      reportedCurrency: CURRENCY.USD,
      additionalComments: 'Here are some comments provided by the bank',
    };

    const reasons = [RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT, RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT];

    const correctionEntity = FeeRecordCorrectionEntityMockBuilder.forIsCompleted(false).withReasons(reasons).build();

    // Act
    await handleFeeRecordCorrectionReceivedEvent(feeRecord, { ...aCorrectionReceivedEventPayload(), correctionEntity, correctionFormData });

    // Assert
    expect(correctionEntity.correctedValues).toEqual({
      feesPaidToUkefForThePeriod: 400,
      feesPaidToUkefForThePeriodCurrency: CURRENCY.USD,
      facilityId: null,
      facilityUtilisation: null,
    });
  });

  it('should set the correction entity as completed', async () => {
    // Arrange
    const feeRecord = new FeeRecordEntityMockBuilder().build();

    const correctionEntity = FeeRecordCorrectionEntityMockBuilder.forIsCompleted(false).withReasons([RECORD_CORRECTION_REASON.OTHER]).build();

    // Act
    await handleFeeRecordCorrectionReceivedEvent(feeRecord, { ...aCorrectionReceivedEventPayload(), correctionEntity });

    // Assert
    expect(correctionEntity.isCompleted).toEqual(true);
  });

  it('should save the additional comment as the bank commentary on the correction entity when provided', async () => {
    // Arrange
    const feeRecord = new FeeRecordEntityMockBuilder().build();

    const correctionEntity = FeeRecordCorrectionEntityMockBuilder.forIsCompleted(false).withReasons([RECORD_CORRECTION_REASON.OTHER]).build();

    const correctionFormData: RecordCorrectionTransientFormData = {
      additionalComments: 'Some additional comments from the bank',
    };

    // Act
    await handleFeeRecordCorrectionReceivedEvent(feeRecord, { ...aCorrectionReceivedEventPayload(), correctionEntity, correctionFormData });

    // Assert
    expect(correctionEntity.bankCommentary).toEqual(correctionFormData.additionalComments);
  });

  it('should leave bank commentary as null when additionalComments are not provided', async () => {
    // Arrange
    const feeRecord = new FeeRecordEntityMockBuilder().build();

    const correctionEntity = FeeRecordCorrectionEntityMockBuilder.forIsCompleted(false).withReasons([RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT]).build();

    const correctionFormData: RecordCorrectionTransientFormData = {
      reportedFee: 400,
      additionalComments: null,
    };

    // Act
    await handleFeeRecordCorrectionReceivedEvent(feeRecord, { ...aCorrectionReceivedEventPayload(), correctionEntity, correctionFormData });

    // Assert
    expect(correctionEntity.bankCommentary).toBeNull();
  });

  it('should set the date received on the correction entity to the current date', async () => {
    // Arrange
    const feeRecord = new FeeRecordEntityMockBuilder().build();

    const correctionEntity = FeeRecordCorrectionEntityMockBuilder.forIsCompleted(false).withReasons([RECORD_CORRECTION_REASON.OTHER]).build();

    // Act
    await handleFeeRecordCorrectionReceivedEvent(feeRecord, { ...aCorrectionReceivedEventPayload(), correctionEntity });

    // Assert
    expect(correctionEntity.dateReceived).toEqual(new Date());
  });

  it('should update the fee record with the values from the form data', async () => {
    // Arrange
    const feeRecord = new FeeRecordEntityMockBuilder()
      .withFeesPaidToUkefForThePeriod(500)
      .withFeesPaidToUkefForThePeriodCurrency(CURRENCY.JPY)
      .withFacilityUtilisation(8000)
      .withFacilityId('00000001')
      .build();

    const correctionFormData: RecordCorrectionTransientFormData = {
      reportedFee: 400,
      reportedCurrency: CURRENCY.USD,
      additionalComments: 'Here are some comments provided by the bank',
    };

    const reasons = [RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT, RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT];

    const correctionEntity = FeeRecordCorrectionEntityMockBuilder.forIsCompleted(false).withReasons(reasons).build();

    // Act
    await handleFeeRecordCorrectionReceivedEvent(feeRecord, { ...aCorrectionReceivedEventPayload(), correctionEntity, correctionFormData });

    // Assert
    expect(feeRecord.feesPaidToUkefForThePeriod).toEqual(400);
    expect(feeRecord.feesPaidToUkefForThePeriodCurrency).toEqual(CURRENCY.USD);

    expect(feeRecord.facilityId).toEqual('00000001');
    expect(feeRecord.facilityUtilisation).toEqual(8000);
  });

  it(`should update the fee record status to ${FEE_RECORD_STATUS.TO_DO_AMENDED}`, async () => {
    // Arrange
    const feeRecord = new FeeRecordEntityMockBuilder().withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION).build();

    // Act
    await handleFeeRecordCorrectionReceivedEvent(feeRecord, aCorrectionReceivedEventPayload());

    // Assert
    expect(feeRecord.status).toEqual(FEE_RECORD_STATUS.TO_DO_AMENDED);
  });
});
