import { RECORD_CORRECTION_REASON, REQUEST_PLATFORM_TYPE } from '../../constants';
import { aRecordCorrectionValues, FeeRecordCorrectionEntityMockBuilder, FeeRecordEntityMockBuilder } from '../../test-helpers';
import { RequestedByUser } from '../../types';
import { DbRequestSource } from '../helpers';
import { FeeRecordCorrectionEntity } from './fee-record-correction.entity';

describe('FeeRecordEntity', () => {
  describe('createRequestedCorrection', () => {
    it('should initialise object with passed in parameters and isCompleted set to false', () => {
      // Arrange
      const feeRecord = new FeeRecordEntityMockBuilder().build();
      const reasons = [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.OTHER];
      const additionalInfo = 'additional information for the correction';
      const requestedByUser: RequestedByUser = {
        id: 'def456',
        firstName: 'Jane',
        lastName: 'Smith',
      };
      const requestSource: DbRequestSource = {
        userId: 'abc123',
        platform: REQUEST_PLATFORM_TYPE.TFM,
      };

      const bankTeamName = 'Payment Officer Team';
      const bankTeamEmails = ['test@ukexportfinance.gov.uk', 'test2@ukexportfinance.gov.uk'];

      // Act
      const correctionEntity = FeeRecordCorrectionEntity.createRequestedCorrection({
        feeRecord,
        requestedByUser,
        reasons,
        additionalInfo,
        requestSource,
        bankTeamName,
        bankTeamEmails,
      });

      // Assert
      expect(correctionEntity.reasons).toEqual(reasons);
      expect(correctionEntity.additionalInfo).toEqual(additionalInfo);
      expect(correctionEntity.requestedByUser).toEqual(requestedByUser);
      expect(correctionEntity.isCompleted).toEqual(false);
      expect(correctionEntity.bankTeamName).toEqual(bankTeamName);
      expect(correctionEntity.bankTeamEmails).toEqual('test@ukexportfinance.gov.uk, test2@ukexportfinance.gov.uk');
    });
  });

  describe('completeCorrection', () => {
    const mockNow = new Date();

    beforeAll(() => {
      jest.useFakeTimers().setSystemTime(mockNow);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('should update the correction with the correction values', () => {
      // Arrange
      const correctionEntity = FeeRecordCorrectionEntityMockBuilder.forIsCompleted(false).build();

      const previousValues = {
        facilityUtilisation: 1000,
        feesPaidToUkefForThePeriod: null,
        feesPaidToUkefForThePeriodCurrency: null,
        facilityId: '00000001',
      };
      const correctedValues = {
        facilityUtilisation: 2000,
        feesPaidToUkefForThePeriod: null,
        feesPaidToUkefForThePeriodCurrency: null,
        facilityId: '11111111',
      };

      const bankCommentary = 'This is some commentary provided by the bank';

      const requestSource = {
        userId: 'abc123',
        platform: REQUEST_PLATFORM_TYPE.PORTAL,
      };

      // Act
      correctionEntity.completeCorrection({ previousValues, correctedValues, bankCommentary, requestSource });

      // Assert
      expect(correctionEntity.previousValues).toEqual(previousValues);
      expect(correctionEntity.correctedValues).toEqual(correctedValues);
      expect(correctionEntity.bankCommentary).toEqual(bankCommentary);
    });

    it('should update the last updated by fields', () => {
      // Arrange
      const correctionEntity = FeeRecordCorrectionEntityMockBuilder.forIsCompleted(false)
        .withLastUpdatedByIsSystemUser(true)
        .withLastUpdatedByPortalUserId(null)
        .withLastUpdatedByTfmUserId(null)
        .build();

      const previousValues = aRecordCorrectionValues();
      const correctedValues = aRecordCorrectionValues();
      const bankCommentary = 'This is some commentary provided by the bank';

      const requestSource = {
        userId: 'abc123',
        platform: REQUEST_PLATFORM_TYPE.PORTAL,
      };

      // Act
      correctionEntity.completeCorrection({ previousValues, correctedValues, bankCommentary, requestSource });

      // Assert
      expect(correctionEntity.lastUpdatedByIsSystemUser).toEqual(false);
      expect(correctionEntity.lastUpdatedByPortalUserId).toEqual(requestSource.userId);
      expect(correctionEntity.lastUpdatedByTfmUserId).toEqual(null);
    });

    it('should set isCompleted to true', () => {
      // Arrange
      const correctionEntity = FeeRecordCorrectionEntityMockBuilder.forIsCompleted(false).build();

      const previousValues = aRecordCorrectionValues();
      const correctedValues = aRecordCorrectionValues();
      const bankCommentary = 'This is some commentary provided by the bank';

      const requestSource = {
        userId: 'abc123',
        platform: REQUEST_PLATFORM_TYPE.PORTAL,
      };

      // Act
      correctionEntity.completeCorrection({ previousValues, correctedValues, bankCommentary, requestSource });

      // Assert
      expect(correctionEntity.isCompleted).toEqual(true);
    });

    it('should set the dateReceived to the current date', () => {
      // Arrange
      const correctionEntity = FeeRecordCorrectionEntityMockBuilder.forIsCompleted(false).build();

      const previousValues = aRecordCorrectionValues();
      const correctedValues = aRecordCorrectionValues();
      const bankCommentary = 'This is some commentary provided by the bank';

      const requestSource = {
        userId: 'abc123',
        platform: REQUEST_PLATFORM_TYPE.PORTAL,
      };

      // Act
      correctionEntity.completeCorrection({ previousValues, correctedValues, bankCommentary, requestSource });

      // Assert
      expect(correctionEntity.dateReceived).toEqual(mockNow);
    });
  });
});
