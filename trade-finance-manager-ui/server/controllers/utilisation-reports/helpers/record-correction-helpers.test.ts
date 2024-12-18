import { mockRecordCorrectionDetails, FeeRecordCorrection } from '@ukef/dtfs2-common';
import { mapToRecordCorrectionTableRowViewModel, mapToRecordCorrectionViewModel } from './record-correction-helpers';
import { getFeeRecordDisplayStatus } from './get-fee-record-display-status';

describe('record-correction-helpers', () => {
  const feeRecordCorrection = mockRecordCorrectionDetails[0];
  const displayStatus = getFeeRecordDisplayStatus(feeRecordCorrection.status);

  describe('mapToRecordCorrectionTableRowViewModel', () => {
    it('should correctly map a fee record correction object to the correct format', () => {
      const result = mapToRecordCorrectionTableRowViewModel(feeRecordCorrection, displayStatus);

      const expected = {
        feeRecordId: feeRecordCorrection.feeRecordId,
        facilityId: feeRecordCorrection.facilityId,
        exporter: feeRecordCorrection.exporter,
        reasons: feeRecordCorrection.reasons,
        dateSent: feeRecordCorrection.dateSent,
        requestedBy: feeRecordCorrection.requestedBy,
        status: feeRecordCorrection.status,
        displayStatus,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('mapToRecordCorrectionViewModel', () => {
    describe('when no record corrections are provided', () => {
      it('should return an empty array', () => {
        const recordCorrectionDetails = [] as FeeRecordCorrection[];

        const result = mapToRecordCorrectionViewModel(recordCorrectionDetails);

        expect(result).toEqual({ recordCorrectionRows: [] });
      });
    });

    it('should correctly map record correction details to the record correction details view model', () => {
      const recordCorrectionDetails = [feeRecordCorrection];

      const result = mapToRecordCorrectionViewModel(recordCorrectionDetails);

      const expected = {
        recordCorrectionRows: [mapToRecordCorrectionTableRowViewModel(feeRecordCorrection, displayStatus)],
      };

      expect(result).toEqual(expected);
    });
  });
});
