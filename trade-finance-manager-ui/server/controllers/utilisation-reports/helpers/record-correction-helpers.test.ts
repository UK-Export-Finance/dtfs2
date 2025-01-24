import { mockRecordCorrectionDetails, FeeRecordCorrectionSummary } from '@ukef/dtfs2-common';
import { mapToRecordCorrectionTableRowViewModel, mapToRecordCorrectionViewModel } from './record-correction-helpers';
import { getFeeRecordDisplayStatus } from './get-fee-record-display-status';

describe('record-correction-helpers', () => {
  const feeRecordCorrection = mockRecordCorrectionDetails[0];
  const displayStatus = getFeeRecordDisplayStatus(feeRecordCorrection.status);

  describe('mapToRecordCorrectionTableRowViewModel', () => {
    it('should correctly map a fee record correction object to the correct format', () => {
      const result = mapToRecordCorrectionTableRowViewModel(feeRecordCorrection, displayStatus);

      const expected = {
        correctionId: feeRecordCorrection.correctionId,
        feeRecordId: feeRecordCorrection.feeRecordId,
        exporter: feeRecordCorrection.exporter,
        reasons: feeRecordCorrection.formattedReasons,
        dateSent: feeRecordCorrection.formattedDateSent,
        status: feeRecordCorrection.status,
        displayStatus,
        formattedCorrectRecords: feeRecordCorrection.formattedCorrectRecords,
        formattedOldRecords: feeRecordCorrection.formattedOldRecords,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('mapToRecordCorrectionViewModel', () => {
    describe('when no record corrections are provided', () => {
      it('should return an empty array', () => {
        const recordCorrectionDetails = [] as FeeRecordCorrectionSummary[];

        const result = mapToRecordCorrectionViewModel(recordCorrectionDetails);

        expect(result).toEqual({ recordCorrectionRows: [] });
      });
    });

    describe('when 1 record correction is present', () => {
      it('should correctly map record correction details to the record correction details view model', () => {
        const recordCorrectionDetails = mockRecordCorrectionDetails[0];

        const result = mapToRecordCorrectionViewModel([recordCorrectionDetails]);

        const expected = {
          recordCorrectionRows: [mapToRecordCorrectionTableRowViewModel(feeRecordCorrection, displayStatus)],
        };

        expect(result).toEqual(expected);
      });
    });

    describe('when multiple record corrections are present', () => {
      it('should correctly map record correction details to the record correction details view model', () => {
        const multipleRecordCorrectionDetails = mockRecordCorrectionDetails;

        const result = mapToRecordCorrectionViewModel(multipleRecordCorrectionDetails);

        const expected = {
          recordCorrectionRows: [
            mapToRecordCorrectionTableRowViewModel(multipleRecordCorrectionDetails[0], displayStatus),
            mapToRecordCorrectionTableRowViewModel(multipleRecordCorrectionDetails[1], displayStatus),
          ],
        };

        expect(result).toEqual(expected);
      });
    });
  });
});
