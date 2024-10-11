import { FEE_RECORD_STATUS } from '@ukef/dtfs2-common';
import { getFeeRecordDisplayStatus } from './get-fee-record-display-status';

describe('get-fee-record-display-status-helper', () => {
  describe('getFeeRecordDisplayStatus', () => {
    it.each([
      { status: FEE_RECORD_STATUS.DOES_NOT_MATCH, expectedDisplayStatus: 'DOES NOT MATCH' },
      { status: FEE_RECORD_STATUS.MATCH, expectedDisplayStatus: 'MATCH' },
      { status: FEE_RECORD_STATUS.TO_DO, expectedDisplayStatus: 'TO DO' },
      { status: FEE_RECORD_STATUS.READY_TO_KEY, expectedDisplayStatus: 'READY TO KEY' },
      { status: FEE_RECORD_STATUS.RECONCILED, expectedDisplayStatus: 'RECONCILED' },
    ])("returns '$expectedDisplayStatus' when the status is '$status'", ({ status, expectedDisplayStatus }) => {
      // Act
      const displayStatus = getFeeRecordDisplayStatus(status);

      // Assert
      expect(displayStatus).toEqual(expectedDisplayStatus);
    });
  });
});
