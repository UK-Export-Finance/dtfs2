import {
  FeeRecordEntityMockBuilder,
  FeeRecordCorrectionEntityMockBuilder,
  mapReasonsToDisplayValues,
  FEE_RECORD_STATUS,
  RECORD_CORRECTION_REASON,
} from '@ukef/dtfs2-common';
import { format } from 'date-fns';
import { getRecordCorrectionDetails } from './get-record-correction-details';
import { mapCorrectionReasonsToFormattedOldFeeRecordValues } from '../../../../../helpers/map-correction-reasons-to-formatted-old-fee-record-values';
import {
  mapCorrectionReasonsToFormattedCorrectValues,
  mapCorrectionReasonsToFormattedPreviousValues,
} from '../../../../../helpers/map-correction-reasons-to-formatted-values';

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
    const correction = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecord, false)
      .withReasons([RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT])
      .withDateRequested(new Date())
      .build();
    feeRecord.corrections = [correction];

    it('should return a mapped array with a single reason', () => {
      const result = getRecordCorrectionDetails([feeRecord]);

      const oldRecords = mapCorrectionReasonsToFormattedOldFeeRecordValues(feeRecord, correction.reasons);
      const formattedOldRecords = oldRecords.join(', ');

      const reasonsArray = mapReasonsToDisplayValues(feeRecord.corrections[0].reasons);

      const expected = [
        {
          correctionId: correction.id,
          feeRecordId: feeRecord.id,
          exporter: feeRecord.exporter,
          status: FEE_RECORD_STATUS.PENDING_CORRECTION,
          formattedReasons: reasonsArray[0],
          formattedDateSent: format(feeRecord.corrections[0].dateRequested, 'dd MMM yyyy'),
          formattedOldRecords,
          formattedCorrectRecords: '-',
        },
      ];
      expect(result).toEqual(expected);
    });
  });

  describe('when a record correction is provided with multiple reasons for 1 fee record', () => {
    const feeRecord = new FeeRecordEntityMockBuilder().withId(feeRecordId).build();
    const correction = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecord, false)
      .withReasons([RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT])
      .withDateRequested(new Date())
      .build();
    feeRecord.corrections = [correction];

    it('should return a mapped array with multiple reasons seperated by commas', () => {
      const result = getRecordCorrectionDetails([feeRecord]);

      const reasonsArray = mapReasonsToDisplayValues(feeRecord.corrections[0].reasons);

      const oldRecords = mapCorrectionReasonsToFormattedOldFeeRecordValues(feeRecord, correction.reasons);
      const formattedOldRecords = oldRecords.join(', ');

      const expected = [
        {
          correctionId: correction.id,
          feeRecordId: feeRecord.id,
          exporter: feeRecord.exporter,
          status: FEE_RECORD_STATUS.PENDING_CORRECTION,
          formattedReasons: `${reasonsArray[0]}, ${reasonsArray[1]}`,
          formattedDateSent: format(feeRecord.corrections[0].dateRequested, 'dd MMM yyyy'),
          formattedOldRecords,
          formattedCorrectRecords: '-',
        },
      ];
      expect(result).toEqual(expected);
    });
  });

  describe('when a feeRecord is provided with multiple corrections', () => {
    const feeRecord = new FeeRecordEntityMockBuilder().withId(feeRecordId).build();
    const correction1 = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecord, false)
      .withReasons([RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT])
      .withDateRequested(new Date())
      .build();

    const correction2 = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecord, false)
      .withReasons([RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT])
      .withDateRequested(new Date())
      .build();

    feeRecord.corrections = [correction1, correction2];

    it('should return a mapped array with multiple corrections', () => {
      const result = getRecordCorrectionDetails([feeRecord]);

      const reasonsArray1 = mapReasonsToDisplayValues(feeRecord.corrections[0].reasons);
      const reasonsArray2 = mapReasonsToDisplayValues(feeRecord.corrections[1].reasons);

      const oldRecords1 = mapCorrectionReasonsToFormattedOldFeeRecordValues(feeRecord, feeRecord.corrections[0].reasons);
      const formattedOldRecords1 = oldRecords1.join(', ');

      const oldRecords2 = mapCorrectionReasonsToFormattedOldFeeRecordValues(feeRecord, feeRecord.corrections[1].reasons);
      const formattedOldRecords2 = oldRecords2.join(', ');

      const expected = [
        {
          correctionId: correction1.id,
          feeRecordId: feeRecord.id,
          exporter: feeRecord.exporter,
          status: FEE_RECORD_STATUS.PENDING_CORRECTION,
          formattedReasons: `${reasonsArray1[0]}, ${reasonsArray1[1]}`,
          formattedDateSent: format(feeRecord.corrections[0].dateRequested, 'dd MMM yyyy'),
          formattedOldRecords: formattedOldRecords1,
          formattedCorrectRecords: '-',
        },
        {
          correctionId: correction2.id,
          feeRecordId: feeRecord.id,
          exporter: feeRecord.exporter,
          status: FEE_RECORD_STATUS.PENDING_CORRECTION,
          formattedReasons: reasonsArray2[0],
          formattedDateSent: format(feeRecord.corrections[1].dateRequested, 'dd MMM yyyy'),
          formattedOldRecords: formattedOldRecords2,
          formattedCorrectRecords: '-',
        },
      ];

      expect(result).toEqual(expected);
    });
  });

  describe('when a multiple feeRecords have corrections', () => {
    const feeRecord1 = new FeeRecordEntityMockBuilder().withId(feeRecordId).build();
    const feeRecord2 = new FeeRecordEntityMockBuilder().withId(feeRecordId2).build();

    const correction1 = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecord1, false)
      .withReasons([RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT])
      .withDateRequested(new Date())
      .build();

    const correction2 = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecord1, false)
      .withReasons([RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT])
      .withDateRequested(new Date())
      .build();

    const correction3 = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecord2, false)
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

      const oldRecords1 = mapCorrectionReasonsToFormattedOldFeeRecordValues(feeRecord1, feeRecord1.corrections[0].reasons);
      const formattedOldRecords1 = oldRecords1.join(', ');

      const oldRecords2 = mapCorrectionReasonsToFormattedOldFeeRecordValues(feeRecord1, feeRecord1.corrections[1].reasons);
      const formattedOldRecords2 = oldRecords2.join(', ');

      const oldRecords3 = mapCorrectionReasonsToFormattedOldFeeRecordValues(feeRecord2, feeRecord2.corrections[0].reasons);
      const formattedOldRecords3 = oldRecords3.join(', ');

      const expected = [
        {
          correctionId: correction1.id,
          feeRecordId: feeRecord1.id,
          exporter: feeRecord1.exporter,
          status: FEE_RECORD_STATUS.PENDING_CORRECTION,
          formattedReasons: `${reasonsArray1[0]}, ${reasonsArray1[1]}`,
          formattedDateSent: format(feeRecord1.corrections[0].dateRequested, 'dd MMM yyyy'),
          formattedOldRecords: formattedOldRecords1,
          formattedCorrectRecords: '-',
        },
        {
          correctionId: correction2.id,
          feeRecordId: feeRecord1.id,
          exporter: feeRecord1.exporter,
          status: FEE_RECORD_STATUS.PENDING_CORRECTION,
          formattedReasons: reasonsArray2[0],
          formattedDateSent: format(feeRecord1.corrections[1].dateRequested, 'dd MMM yyyy'),
          formattedOldRecords: formattedOldRecords2,
          formattedCorrectRecords: '-',
        },
        {
          correctionId: correction3.id,
          feeRecordId: feeRecord2.id,
          exporter: feeRecord2.exporter,
          status: FEE_RECORD_STATUS.PENDING_CORRECTION,
          formattedReasons: reasonsArray3[0],
          formattedDateSent: format(feeRecord2.corrections[0].dateRequested, 'dd MMM yyyy'),
          formattedOldRecords: formattedOldRecords3,
          formattedCorrectRecords: '-',
        },
      ];

      expect(result).toEqual(expected);
    });
  });

  describe('when multiple feeRecords are present, with and without corrections', () => {
    const feeRecord1 = new FeeRecordEntityMockBuilder().withId(feeRecordId).build();
    const feeRecord2 = new FeeRecordEntityMockBuilder().withId(feeRecordId2).build();
    const feeRecord3 = new FeeRecordEntityMockBuilder().withId(feeRecordId3).withCorrections([]).build();

    const correction1 = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecord1, false)
      .withReasons([RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT])
      .withDateRequested(new Date())
      .build();

    const correction2 = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecord1, false)
      .withReasons([RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT])
      .withDateRequested(new Date())
      .build();

    const correction3 = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecord2, false)
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

      const oldRecords1 = mapCorrectionReasonsToFormattedOldFeeRecordValues(feeRecord1, feeRecord1.corrections[0].reasons);
      const formattedOldRecords1 = oldRecords1.join(', ');

      const oldRecords2 = mapCorrectionReasonsToFormattedOldFeeRecordValues(feeRecord1, feeRecord1.corrections[1].reasons);
      const formattedOldRecords2 = oldRecords2.join(', ');

      const oldRecords3 = mapCorrectionReasonsToFormattedOldFeeRecordValues(feeRecord2, feeRecord2.corrections[0].reasons);
      const formattedOldRecords3 = oldRecords3.join(', ');

      const expected = [
        {
          correctionId: correction1.id,
          feeRecordId: feeRecord1.id,
          exporter: feeRecord1.exporter,
          status: FEE_RECORD_STATUS.PENDING_CORRECTION,
          formattedReasons: `${reasonsArray1[0]}, ${reasonsArray1[1]}`,
          formattedDateSent: format(feeRecord1.corrections[0].dateRequested, 'dd MMM yyyy'),
          formattedOldRecords: formattedOldRecords1,
          formattedCorrectRecords: '-',
        },
        {
          correctionId: correction2.id,
          feeRecordId: feeRecord1.id,
          exporter: feeRecord1.exporter,
          status: FEE_RECORD_STATUS.PENDING_CORRECTION,
          formattedReasons: reasonsArray2[0],
          formattedDateSent: format(feeRecord1.corrections[1].dateRequested, 'dd MMM yyyy'),
          formattedOldRecords: formattedOldRecords2,
          formattedCorrectRecords: '-',
        },
        {
          correctionId: correction3.id,
          feeRecordId: feeRecord2.id,
          exporter: feeRecord2.exporter,
          status: FEE_RECORD_STATUS.PENDING_CORRECTION,
          formattedReasons: reasonsArray3[0],
          formattedDateSent: format(feeRecord2.corrections[0].dateRequested, 'dd MMM yyyy'),
          formattedOldRecords: formattedOldRecords3,
          formattedCorrectRecords: '-',
        },
      ];

      expect(result).toEqual(expected);
    });
  });

  describe(`when a record correction is completed and feeRecords have a status of ${FEE_RECORD_STATUS.TO_DO_AMENDED}`, () => {
    const feeRecord1 = new FeeRecordEntityMockBuilder().withId(feeRecordId).withStatus(FEE_RECORD_STATUS.TO_DO_AMENDED).build();
    const feeRecord2 = new FeeRecordEntityMockBuilder().withId(feeRecordId2).withStatus(FEE_RECORD_STATUS.TO_DO_AMENDED).build();
    const feeRecord3 = new FeeRecordEntityMockBuilder().withId(feeRecordId3).withStatus(FEE_RECORD_STATUS.TO_DO_AMENDED).withCorrections([]).build();

    const correction1 = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecord1, true)
      .withReasons([RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT])
      .withDateRequested(new Date())
      .build();

    const correction2 = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecord1, true)
      .withReasons([RECORD_CORRECTION_REASON.UTILISATION_INCORRECT])
      .withDateRequested(new Date())
      .build();

    const correction3 = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecord2, true)
      .withReasons([RECORD_CORRECTION_REASON.UTILISATION_INCORRECT])
      .withDateRequested(new Date())
      .build();

    feeRecord1.corrections = [correction1, correction2];
    feeRecord2.corrections = [correction3];

    it('should populate formattedOldRecords and formattedCorrectRecords from mapCorrectionReasonsToFormattedPreviousValues and mapCorrectionReasonsToFormattedCorrectValues', () => {
      const result = getRecordCorrectionDetails([feeRecord1, feeRecord2, feeRecord3]);

      const reasonsArray1 = mapReasonsToDisplayValues(feeRecord1.corrections[0].reasons);
      const reasonsArray2 = mapReasonsToDisplayValues(feeRecord1.corrections[1].reasons);
      const reasonsArray3 = mapReasonsToDisplayValues(feeRecord2.corrections[0].reasons);

      const oldRecords1 = mapCorrectionReasonsToFormattedPreviousValues(correction1, feeRecord1.corrections[0].reasons);
      const formattedOldRecords1 = oldRecords1.join(', ');

      const oldRecords2 = mapCorrectionReasonsToFormattedPreviousValues(correction2, feeRecord1.corrections[1].reasons);
      const formattedOldRecords2 = oldRecords2.join(', ');

      const oldRecords3 = mapCorrectionReasonsToFormattedPreviousValues(correction3, feeRecord2.corrections[0].reasons);
      const formattedOldRecords3 = oldRecords3.join(', ');

      const newRecords1 = mapCorrectionReasonsToFormattedCorrectValues(correction1, feeRecord1.corrections[0].reasons);
      const formattedNewRecords1 = newRecords1.join(', ');

      const newRecords2 = mapCorrectionReasonsToFormattedCorrectValues(correction2, feeRecord1.corrections[1].reasons);
      const formattedNewRecords2 = newRecords2.join(', ');

      const newRecords3 = mapCorrectionReasonsToFormattedCorrectValues(correction3, feeRecord2.corrections[0].reasons);
      const formattedNewRecords3 = newRecords3.join(', ');

      const expected = [
        {
          correctionId: correction1.id,
          feeRecordId: feeRecord1.id,
          exporter: feeRecord1.exporter,
          status: FEE_RECORD_STATUS.PENDING_CORRECTION,
          formattedReasons: reasonsArray1[0],
          formattedDateSent: format(feeRecord1.corrections[0].dateRequested, 'dd MMM yyyy'),
          formattedOldRecords: formattedOldRecords1,
          formattedCorrectRecords: formattedNewRecords1,
        },
        {
          correctionId: correction2.id,
          feeRecordId: feeRecord1.id,
          exporter: feeRecord1.exporter,
          status: FEE_RECORD_STATUS.PENDING_CORRECTION,
          formattedReasons: reasonsArray2[0],
          formattedDateSent: format(feeRecord1.corrections[1].dateRequested, 'dd MMM yyyy'),
          formattedOldRecords: formattedOldRecords2,
          formattedCorrectRecords: formattedNewRecords2,
        },
        {
          correctionId: correction3.id,
          feeRecordId: feeRecord2.id,
          exporter: feeRecord2.exporter,
          status: FEE_RECORD_STATUS.PENDING_CORRECTION,
          formattedReasons: reasonsArray3[0],
          formattedDateSent: format(feeRecord2.corrections[0].dateRequested, 'dd MMM yyyy'),
          formattedOldRecords: formattedOldRecords3,
          formattedCorrectRecords: formattedNewRecords3,
        },
      ];

      expect(result).toEqual(expected);
    });
  });

  describe(`when a record correction is completed and feeRecords have a status of ${FEE_RECORD_STATUS.TO_DO_AMENDED} and ${FEE_RECORD_STATUS.PENDING_CORRECTION}`, () => {
    const feeRecord1 = new FeeRecordEntityMockBuilder().withId(feeRecordId).withStatus(FEE_RECORD_STATUS.TO_DO_AMENDED).build();
    const feeRecord2 = new FeeRecordEntityMockBuilder().withId(feeRecordId2).withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION).build();
    const feeRecord3 = new FeeRecordEntityMockBuilder().withId(feeRecordId3).withStatus(FEE_RECORD_STATUS.TO_DO_AMENDED).withCorrections([]).build();

    const correction1 = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecord1, true)
      .withReasons([RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT])
      .withDateRequested(new Date())
      .build();

    const correction2 = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecord1, true)
      .withReasons([RECORD_CORRECTION_REASON.UTILISATION_INCORRECT])
      .withDateRequested(new Date())
      .build();

    const correction3 = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecord2, true)
      .withReasons([RECORD_CORRECTION_REASON.UTILISATION_INCORRECT])
      .withDateRequested(new Date())
      .build();

    feeRecord1.corrections = [correction1, correction2];
    feeRecord2.corrections = [correction3];

    it(`should populate return formattedCorrectRecords as "-" for the feeRecord which is NOT ${FEE_RECORD_STATUS.TO_DO_AMENDED}`, () => {
      const result = getRecordCorrectionDetails([feeRecord1, feeRecord2, feeRecord3]);

      const reasonsArray1 = mapReasonsToDisplayValues(feeRecord1.corrections[0].reasons);
      const reasonsArray2 = mapReasonsToDisplayValues(feeRecord1.corrections[1].reasons);
      const reasonsArray3 = mapReasonsToDisplayValues(feeRecord2.corrections[0].reasons);

      const oldRecords1 = mapCorrectionReasonsToFormattedPreviousValues(correction1, feeRecord1.corrections[0].reasons);
      const formattedOldRecords1 = oldRecords1.join(', ');

      const oldRecords2 = mapCorrectionReasonsToFormattedPreviousValues(correction2, feeRecord1.corrections[1].reasons);
      const formattedOldRecords2 = oldRecords2.join(', ');

      const oldRecords3 = mapCorrectionReasonsToFormattedOldFeeRecordValues(feeRecord2, feeRecord2.corrections[0].reasons);
      const formattedOldRecords3 = oldRecords3.join(', ');

      const newRecords1 = mapCorrectionReasonsToFormattedCorrectValues(correction1, feeRecord1.corrections[0].reasons);
      const formattedNewRecords1 = newRecords1.join(', ');

      const newRecords2 = mapCorrectionReasonsToFormattedCorrectValues(correction2, feeRecord1.corrections[1].reasons);
      const formattedNewRecords2 = newRecords2.join(', ');

      const expected = [
        {
          correctionId: correction1.id,
          feeRecordId: feeRecord1.id,
          exporter: feeRecord1.exporter,
          status: FEE_RECORD_STATUS.PENDING_CORRECTION,
          formattedReasons: reasonsArray1[0],
          formattedDateSent: format(feeRecord1.corrections[0].dateRequested, 'dd MMM yyyy'),
          formattedOldRecords: formattedOldRecords1,
          formattedCorrectRecords: formattedNewRecords1,
        },
        {
          correctionId: correction2.id,
          feeRecordId: feeRecord1.id,
          exporter: feeRecord1.exporter,
          status: FEE_RECORD_STATUS.PENDING_CORRECTION,
          formattedReasons: reasonsArray2[0],
          formattedDateSent: format(feeRecord1.corrections[1].dateRequested, 'dd MMM yyyy'),
          formattedOldRecords: formattedOldRecords2,
          formattedCorrectRecords: formattedNewRecords2,
        },
        {
          correctionId: correction3.id,
          feeRecordId: feeRecord2.id,
          exporter: feeRecord2.exporter,
          status: FEE_RECORD_STATUS.PENDING_CORRECTION,
          formattedReasons: reasonsArray3[0],
          formattedDateSent: format(feeRecord2.corrections[0].dateRequested, 'dd MMM yyyy'),
          formattedOldRecords: formattedOldRecords3,
          formattedCorrectRecords: '-',
        },
      ];

      expect(result).toEqual(expected);
    });
  });
});
