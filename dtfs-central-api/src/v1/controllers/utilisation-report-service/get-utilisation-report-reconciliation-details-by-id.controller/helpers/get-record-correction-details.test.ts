import {
  FeeRecordEntityMockBuilder,
  FeeRecordCorrectionEntityMockBuilder,
  mapReasonsToDisplayValues,
  UtilisationReportEntityMockBuilder,
  PENDING_RECONCILIATION,
  FEE_RECORD_STATUS,
  RECORD_CORRECTION_REASON,
} from '@ukef/dtfs2-common';
import { format } from 'date-fns';
import { getRecordCorrectionDetails } from './get-record-correction-details';

describe('get-record-correction-details', () => {
  const feeRecordId = 11;

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('when no record corrections are provided', () => {
    const uploadedUtilisationReport = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).build();
    const feeRecord = FeeRecordEntityMockBuilder.forReport(uploadedUtilisationReport).withId(feeRecordId).withCorrections([]).build();
    uploadedUtilisationReport.feeRecords = [feeRecord];

    it('should return an empty array if no corrections are provided', () => {
      const result = getRecordCorrectionDetails(uploadedUtilisationReport.feeRecords);

      expect(result).toEqual([]);
    });
  });

  describe('when a record correction is provided with one reason', () => {
    const uploadedUtilisationReport = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).build();
    const feeRecord = FeeRecordEntityMockBuilder.forReport(uploadedUtilisationReport).withId(feeRecordId).build();
    const corrections = FeeRecordCorrectionEntityMockBuilder.forFeeRecord(feeRecord).withReasons([RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT]).build();
    corrections.dateRequested = new Date();
    feeRecord.corrections = [corrections];
    uploadedUtilisationReport.feeRecords = [feeRecord];

    it('should return a mapped array with a single reason', () => {
      const result = getRecordCorrectionDetails(uploadedUtilisationReport.feeRecords);

      const reasonsArray = mapReasonsToDisplayValues(feeRecord.corrections[0].reasons);

      const expected = [
        {
          correctionId: corrections.id,
          feeRecordId: feeRecord.id,
          facilityId: feeRecord.facilityId,
          exporter: feeRecord.exporter,
          status: FEE_RECORD_STATUS.PENDING_CORRECTION,
          formattedReasons: reasonsArray[0],
          formattedDateSent: format(feeRecord.corrections[0].dateRequested, 'dd MMM yyyy'),
          requestedBy: `${feeRecord.corrections[0].requestedByUser.firstName} ${feeRecord.corrections[0].requestedByUser.lastName}`,
        },
      ];
      expect(result).toEqual(expected);
    });
  });

  describe('when a record correction is provided with multiple reasons', () => {
    const uploadedUtilisationReport = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).build();
    const feeRecord = FeeRecordEntityMockBuilder.forReport(uploadedUtilisationReport).withId(feeRecordId).build();
    const corrections = FeeRecordCorrectionEntityMockBuilder.forFeeRecord(feeRecord)
      .withReasons([RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT])
      .build();
    corrections.dateRequested = new Date();
    feeRecord.corrections = [corrections];
    uploadedUtilisationReport.feeRecords = [feeRecord];

    it('should return a mapped array with multiple reasons seperated by commas', () => {
      const result = getRecordCorrectionDetails(uploadedUtilisationReport.feeRecords);

      const reasonsArray = mapReasonsToDisplayValues(feeRecord.corrections[0].reasons);

      const expected = [
        {
          correctionId: corrections.id,
          feeRecordId: feeRecord.id,
          facilityId: feeRecord.facilityId,
          exporter: feeRecord.exporter,
          status: FEE_RECORD_STATUS.PENDING_CORRECTION,
          formattedReasons: `${reasonsArray[0]}, ${reasonsArray[1]}`,
          formattedDateSent: format(feeRecord.corrections[0].dateRequested, 'dd MMM yyyy'),
          requestedBy: `${feeRecord.corrections[0].requestedByUser.firstName} ${feeRecord.corrections[0].requestedByUser.lastName}`,
        },
      ];
      expect(result).toEqual(expected);
    });
  });
});
