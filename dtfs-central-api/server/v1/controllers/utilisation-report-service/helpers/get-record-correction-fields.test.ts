import { FeeRecordCorrectionEntityMockBuilder } from '@ukef/dtfs2-common/test-helpers';
import { format } from 'date-fns';
import { DATE_FORMATS, mapReasonsToDisplayValues } from '@ukef/dtfs2-common';
import { getRecordCorrectionFields } from './get-record-correction-fields';
import { getFormattedOldAndCorrectValues } from './get-formatted-old-and-correct-values';

describe('get-record-correction-fields', () => {
  const bankTeamEmails = ['test1@ukexportfinance.gov.uk', 'test2@ukexportfinance.gov.uk'];

  describe('when a correction is not completed - isCompleted=false', () => {
    const dateRequested = new Date('2024-01-01');

    const feeRecordCorrectionEntity = FeeRecordCorrectionEntityMockBuilder.forIsCompleted(false)
      .withDateRequested(dateRequested)
      .withBankTeamEmails(`${bankTeamEmails[0]},${bankTeamEmails[1]}`)
      .build();

    it('should return the fields with formattedDateReceived and formattedBankCommentary as "-"', () => {
      const result = getRecordCorrectionFields(feeRecordCorrectionEntity.feeRecord, feeRecordCorrectionEntity);

      const { formattedOldRecords } = getFormattedOldAndCorrectValues(feeRecordCorrectionEntity, feeRecordCorrectionEntity.feeRecord);
      const reasonsArray = mapReasonsToDisplayValues(feeRecordCorrectionEntity.reasons);

      const expected = {
        facilityId: feeRecordCorrectionEntity.feeRecord.facilityId,
        correctionId: feeRecordCorrectionEntity.id,
        feeRecordId: feeRecordCorrectionEntity.feeRecord.id,
        exporter: feeRecordCorrectionEntity.feeRecord.exporter,
        formattedReasons: reasonsArray.join(', '),
        formattedDateSent: format(dateRequested, DATE_FORMATS.DD_MMM_YYYY),
        formattedOldRecords,
        formattedCorrectRecords: '-',
        isCompleted: false,
        bankTeamName: feeRecordCorrectionEntity.bankTeamName,
        bankTeamEmails,
        additionalInfo: feeRecordCorrectionEntity.additionalInfo,
        formattedBankCommentary: '-',
        formattedDateReceived: '-',
        formattedRequestedByUser: `${feeRecordCorrectionEntity.requestedByUser.firstName} ${feeRecordCorrectionEntity.requestedByUser.lastName}`,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when a correction is completed - isCompleted=true', () => {
    const dateRequested = new Date('2024-02-01');
    const dateReceived = new Date('2024-02-10');

    const feeRecordCorrectionEntity = FeeRecordCorrectionEntityMockBuilder.forIsCompleted(true)
      .withDateRequested(dateRequested)
      .withDateReceived(dateReceived)
      .withBankTeamEmails(`${bankTeamEmails[0]},${bankTeamEmails[1]}`)
      .build();

    it('should return the fields with formattedDateReceived and formattedBankCommentary as the date and commentary', () => {
      const result = getRecordCorrectionFields(feeRecordCorrectionEntity.feeRecord, feeRecordCorrectionEntity);

      const { formattedOldRecords, formattedCorrectRecords } = getFormattedOldAndCorrectValues(feeRecordCorrectionEntity, feeRecordCorrectionEntity.feeRecord);
      const reasonsArray = mapReasonsToDisplayValues(feeRecordCorrectionEntity.reasons);

      const expected = {
        facilityId: feeRecordCorrectionEntity.feeRecord.facilityId,
        correctionId: feeRecordCorrectionEntity.id,
        feeRecordId: feeRecordCorrectionEntity.feeRecord.id,
        exporter: feeRecordCorrectionEntity.feeRecord.exporter,
        formattedReasons: reasonsArray.join(', '),
        formattedDateSent: format(dateRequested, DATE_FORMATS.DD_MMM_YYYY),
        formattedOldRecords,
        formattedCorrectRecords,
        isCompleted: true,
        bankTeamName: feeRecordCorrectionEntity.bankTeamName,
        bankTeamEmails,
        additionalInfo: feeRecordCorrectionEntity.additionalInfo,
        formattedBankCommentary: feeRecordCorrectionEntity.bankCommentary,
        formattedDateReceived: format(dateReceived, DATE_FORMATS.DD_MMM_YYYY),
        formattedRequestedByUser: `${feeRecordCorrectionEntity.requestedByUser.firstName} ${feeRecordCorrectionEntity.requestedByUser.lastName}`,
      };

      expect(result).toEqual(expected);
    });
  });
});
