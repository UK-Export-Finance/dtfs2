import {
  FeeRecordEntityMockBuilder,
  FeeRecordCorrectionEntityMockBuilder,
  mapReasonsToDisplayValues,
  FEE_RECORD_STATUS,
  RECORD_CORRECTION_REASON,
} from '@ukef/dtfs2-common';
import { format } from 'date-fns';
import { getRecordCorrectionDetails } from './get-record-correction-details';

describe('get-record-correction-details', () => {
  const feeRecordId = 11;
  const feeRecordId2 = 12;
  const feeRecordId3 = 13;

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('when no record corrections are provided', () => {
    const feeRecord = new FeeRecordEntityMockBuilder().withId(feeRecordId).withCorrections([]).build();

    it('should return an empty array if no corrections are provided', () => {
      const result = getRecordCorrectionDetails([feeRecord]);

      expect(result).toEqual([]);
    });
  });

  describe('when a record correction is provided with one reason for 1 fee record', () => {
    const feeRecord = new FeeRecordEntityMockBuilder().withId(feeRecordId).build();
    const correction = FeeRecordCorrectionEntityMockBuilder.forFeeRecord(feeRecord)
      .withReasons([RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT])
      .withDateRequested(new Date())
      .build();
    feeRecord.corrections = [correction];

    it('should return a mapped array with a single reason', () => {
      const result = getRecordCorrectionDetails([feeRecord]);

      const reasonsArray = mapReasonsToDisplayValues(feeRecord.corrections[0].reasons);

      const expected = [
        {
          correctionId: correction.id,
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

  describe('when a record correction is provided with multiple reasons for 1 fee record', () => {
    const feeRecord = new FeeRecordEntityMockBuilder().withId(feeRecordId).build();
    const correction = FeeRecordCorrectionEntityMockBuilder.forFeeRecord(feeRecord)
      .withReasons([RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT])
      .withDateRequested(new Date())
      .build();
    feeRecord.corrections = [correction];

    it('should return a mapped array with multiple reasons seperated by commas', () => {
      const result = getRecordCorrectionDetails([feeRecord]);

      const reasonsArray = mapReasonsToDisplayValues(feeRecord.corrections[0].reasons);

      const expected = [
        {
          correctionId: correction.id,
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

  describe('when a feeRecord is provided with multiple corrections', () => {
    const feeRecord = new FeeRecordEntityMockBuilder().withId(feeRecordId).build();
    const correction1 = FeeRecordCorrectionEntityMockBuilder.forFeeRecord(feeRecord)
      .withReasons([RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT])
      .withDateRequested(new Date())
      .build();

    const correction2 = FeeRecordCorrectionEntityMockBuilder.forFeeRecord(feeRecord)
      .withReasons([RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT])
      .withDateRequested(new Date())
      .build();

    feeRecord.corrections = [correction1, correction2];

    it('should return a mapped array with multiple corrections', () => {
      const result = getRecordCorrectionDetails([feeRecord]);

      const reasonsArray1 = mapReasonsToDisplayValues(feeRecord.corrections[0].reasons);
      const reasonsArray2 = mapReasonsToDisplayValues(feeRecord.corrections[1].reasons);

      const expected = [
        {
          correctionId: correction1.id,
          feeRecordId: feeRecord.id,
          facilityId: feeRecord.facilityId,
          exporter: feeRecord.exporter,
          status: FEE_RECORD_STATUS.PENDING_CORRECTION,
          formattedReasons: `${reasonsArray1[0]}, ${reasonsArray1[1]}`,
          formattedDateSent: format(feeRecord.corrections[0].dateRequested, 'dd MMM yyyy'),
          requestedBy: `${feeRecord.corrections[0].requestedByUser.firstName} ${feeRecord.corrections[0].requestedByUser.lastName}`,
        },
        {
          correctionId: correction2.id,
          feeRecordId: feeRecord.id,
          facilityId: feeRecord.facilityId,
          exporter: feeRecord.exporter,
          status: FEE_RECORD_STATUS.PENDING_CORRECTION,
          formattedReasons: reasonsArray2[0],
          formattedDateSent: format(feeRecord.corrections[1].dateRequested, 'dd MMM yyyy'),
          requestedBy: `${feeRecord.corrections[1].requestedByUser.firstName} ${feeRecord.corrections[1].requestedByUser.lastName}`,
        },
      ];

      expect(result).toEqual(expected);
    });
  });

  describe('when a multiple feeRecords have corrections', () => {
    const feeRecord1 = new FeeRecordEntityMockBuilder().withId(feeRecordId).build();
    const feeRecord2 = new FeeRecordEntityMockBuilder().withId(feeRecordId2).build();

    const correction1 = FeeRecordCorrectionEntityMockBuilder.forFeeRecord(feeRecord1)
      .withReasons([RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT])
      .withDateRequested(new Date())
      .build();

    const correction2 = FeeRecordCorrectionEntityMockBuilder.forFeeRecord(feeRecord1)
      .withReasons([RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT])
      .withDateRequested(new Date())
      .build();

    const correction3 = FeeRecordCorrectionEntityMockBuilder.forFeeRecord(feeRecord2)
      .withReasons([RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT])
      .withDateRequested(new Date())
      .build();

    feeRecord1.corrections = [correction1, correction2];
    feeRecord2.corrections = [correction3];

    it('should return a mapped array with multiple corrections for all the fee records', () => {
      const result = getRecordCorrectionDetails([feeRecord1, feeRecord2]);

      const reasonsArray1 = mapReasonsToDisplayValues(feeRecord1.corrections[0].reasons);
      const reasonsArray2 = mapReasonsToDisplayValues(feeRecord1.corrections[1].reasons);
      const reasonsArray3 = mapReasonsToDisplayValues(feeRecord2.corrections[0].reasons);

      const expected = [
        {
          correctionId: correction1.id,
          feeRecordId: feeRecord1.id,
          facilityId: feeRecord1.facilityId,
          exporter: feeRecord1.exporter,
          status: FEE_RECORD_STATUS.PENDING_CORRECTION,
          formattedReasons: `${reasonsArray1[0]}, ${reasonsArray1[1]}`,
          formattedDateSent: format(feeRecord1.corrections[0].dateRequested, 'dd MMM yyyy'),
          requestedBy: `${feeRecord1.corrections[0].requestedByUser.firstName} ${feeRecord1.corrections[0].requestedByUser.lastName}`,
        },
        {
          correctionId: correction2.id,
          feeRecordId: feeRecord1.id,
          facilityId: feeRecord1.facilityId,
          exporter: feeRecord1.exporter,
          status: FEE_RECORD_STATUS.PENDING_CORRECTION,
          formattedReasons: reasonsArray2[0],
          formattedDateSent: format(feeRecord1.corrections[1].dateRequested, 'dd MMM yyyy'),
          requestedBy: `${feeRecord1.corrections[1].requestedByUser.firstName} ${feeRecord1.corrections[1].requestedByUser.lastName}`,
        },
        {
          correctionId: correction3.id,
          feeRecordId: feeRecord2.id,
          facilityId: feeRecord2.facilityId,
          exporter: feeRecord2.exporter,
          status: FEE_RECORD_STATUS.PENDING_CORRECTION,
          formattedReasons: reasonsArray3[0],
          formattedDateSent: format(feeRecord2.corrections[0].dateRequested, 'dd MMM yyyy'),
          requestedBy: `${feeRecord2.corrections[0].requestedByUser.firstName} ${feeRecord2.corrections[0].requestedByUser.lastName}`,
        },
      ];

      expect(result).toEqual(expected);
    });
  });

  describe('when multiple feeRecords are present, with and without corrections', () => {
    const feeRecord1 = new FeeRecordEntityMockBuilder().withId(feeRecordId).build();
    const feeRecord2 = new FeeRecordEntityMockBuilder().withId(feeRecordId2).build();
    const feeRecord3 = new FeeRecordEntityMockBuilder().withId(feeRecordId3).withCorrections([]).build();

    const correction1 = FeeRecordCorrectionEntityMockBuilder.forFeeRecord(feeRecord1)
      .withReasons([RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT])
      .withDateRequested(new Date())
      .build();

    const correction2 = FeeRecordCorrectionEntityMockBuilder.forFeeRecord(feeRecord1)
      .withReasons([RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT])
      .withDateRequested(new Date())
      .build();

    const correction3 = FeeRecordCorrectionEntityMockBuilder.forFeeRecord(feeRecord2)
      .withReasons([RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT])
      .withDateRequested(new Date())
      .build();

    feeRecord1.corrections = [correction1, correction2];
    feeRecord2.corrections = [correction3];

    it('should return a mapped array with multiple corrections only for those fee records with corrections', () => {
      const result = getRecordCorrectionDetails([feeRecord1, feeRecord2, feeRecord3]);

      const reasonsArray1 = mapReasonsToDisplayValues(feeRecord1.corrections[0].reasons);
      const reasonsArray2 = mapReasonsToDisplayValues(feeRecord1.corrections[1].reasons);
      const reasonsArray3 = mapReasonsToDisplayValues(feeRecord2.corrections[0].reasons);

      const expected = [
        {
          correctionId: correction1.id,
          feeRecordId: feeRecord1.id,
          facilityId: feeRecord1.facilityId,
          exporter: feeRecord1.exporter,
          status: FEE_RECORD_STATUS.PENDING_CORRECTION,
          formattedReasons: `${reasonsArray1[0]}, ${reasonsArray1[1]}`,
          formattedDateSent: format(feeRecord1.corrections[0].dateRequested, 'dd MMM yyyy'),
          requestedBy: `${feeRecord1.corrections[0].requestedByUser.firstName} ${feeRecord1.corrections[0].requestedByUser.lastName}`,
        },
        {
          correctionId: correction2.id,
          feeRecordId: feeRecord1.id,
          facilityId: feeRecord1.facilityId,
          exporter: feeRecord1.exporter,
          status: FEE_RECORD_STATUS.PENDING_CORRECTION,
          formattedReasons: reasonsArray2[0],
          formattedDateSent: format(feeRecord1.corrections[1].dateRequested, 'dd MMM yyyy'),
          requestedBy: `${feeRecord1.corrections[1].requestedByUser.firstName} ${feeRecord1.corrections[1].requestedByUser.lastName}`,
        },
        {
          correctionId: correction3.id,
          feeRecordId: feeRecord2.id,
          facilityId: feeRecord2.facilityId,
          exporter: feeRecord2.exporter,
          status: FEE_RECORD_STATUS.PENDING_CORRECTION,
          formattedReasons: reasonsArray3[0],
          formattedDateSent: format(feeRecord2.corrections[0].dateRequested, 'dd MMM yyyy'),
          requestedBy: `${feeRecord2.corrections[0].requestedByUser.firstName} ${feeRecord2.corrections[0].requestedByUser.lastName}`,
        },
      ];

      expect(result).toEqual(expected);
    });
  });
});
