import { REQUEST_PLATFORM_TYPE } from '../../constants';
import { FeeRecordEntityMockBuilder } from '../../test-helpers';
import { RequestedByUser } from '../../types';
import { DbRequestSource } from '../helpers';
import { FeeRecordCorrectionEntity } from './fee-record-correction.entity';

describe('FeeRecordEntity', () => {
  describe('createRequestedCorrection', () => {
    it('initiates object with passed in parameters and isCompleted set to false', () => {
      // Arrange
      const feeRecord = new FeeRecordEntityMockBuilder().build();
      const reasons = ['some reasons'];
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

      // Act
      const correctionEntity = FeeRecordCorrectionEntity.createRequestedCorrection({ feeRecord, requestedByUser, reasons, additionalInfo, requestSource });

      // Assert
      expect(correctionEntity.reasons).toEqual(reasons);
      expect(correctionEntity.additionalInfo).toEqual(additionalInfo);
      expect(correctionEntity.requestedByUser).toEqual(requestedByUser);
      expect(correctionEntity.isCompleted).toEqual(false);
    });
  });
});
