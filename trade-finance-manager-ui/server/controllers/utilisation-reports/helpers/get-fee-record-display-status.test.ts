import { FEE_RECORD_STATUS } from '@ukef/dtfs2-common';
import { getFeeRecordDisplayStatus } from './get-fee-record-display-status';

describe('get-fee-record-display-status-helper', () => {
  describe('getFeeRecordDisplayStatus', () => {
    it.each([
      { status: FEE_RECORD_STATUS.DOES_NOT_MATCH, expectedDisplayStatus: 'Does not match' },
      { status: FEE_RECORD_STATUS.MATCH, expectedDisplayStatus: 'Match' },
      { status: FEE_RECORD_STATUS.TO_DO, expectedDisplayStatus: 'To do' },
      { status: FEE_RECORD_STATUS.READY_TO_KEY, expectedDisplayStatus: 'Ready to key' },
      { status: FEE_RECORD_STATUS.RECONCILED, expectedDisplayStatus: 'Reconciled' },
      { status: FEE_RECORD_STATUS.PENDING_CORRECTION, expectedDisplayStatus: 'Record correction sent' },
    ])("returns '$expectedDisplayStatus' when the status is '$status'", ({ status, expectedDisplayStatus }) => {
      // Act
      const displayStatus = getFeeRecordDisplayStatus(status);

      // Assert
      expect(displayStatus).toEqual(expectedDisplayStatus);
    });
  });
});
