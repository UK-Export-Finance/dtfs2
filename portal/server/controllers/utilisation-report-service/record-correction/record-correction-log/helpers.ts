import { DATE_FORMATS, getKeyToDateSortValueMap, IsoDateTimeStamp } from '@ukef/dtfs2-common';
import { format, parseISO } from 'date-fns';
import { CompletedCorrectionViewModel } from '../../../../types/view-models/record-correction/record-correction-log';
import { GetCompletedFeeRecordCorrectionsResponseBody } from '../../../../api-response-types';

/**
 * Formats the date sent
 * @param dateSent - The date sent
 * @returns The formatted date
 * @example
 * getFormattedDateSent('2024-01-01T12:30:00.000'); // '01 Jan 2024'
 */
export const getFormattedDateSent = (dateSent: IsoDateTimeStamp): string => format(parseISO(dateSent), DATE_FORMATS.DD_MMM_YYYY);

/**
 * Maps completed corrections to a view model.
 * @param completedCorrections - The completed corrections response body.
 * @returns An array of completed correction view models.
 */
export const mapCompletedCorrectionsToViewModel = (completedCorrections: GetCompletedFeeRecordCorrectionsResponseBody): CompletedCorrectionViewModel[] => {
  const correctionIdToDateSentDataSortValueMap = getKeyToDateSortValueMap(completedCorrections.map(({ id, dateSent }) => ({ key: id, date: dateSent })));

  return completedCorrections.map((correction) => {
    const { exporter, formattedReasons, formattedPreviousValues, formattedCorrectedValues, bankCommentary } = correction;

    const formattedBankCommentary = bankCommentary ?? '-';

    return {
      dateSent: {
        formattedDateSent: getFormattedDateSent(correction.dateSent),
        dataSortValue: correctionIdToDateSentDataSortValueMap[correction.id],
      },
      exporter,
      formattedReasons,
      formattedPreviousValues,
      formattedCorrectedValues,
      formattedBankCommentary,
    };
  });
};
