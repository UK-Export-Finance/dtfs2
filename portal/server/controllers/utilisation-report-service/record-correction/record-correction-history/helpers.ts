import { getKeyToDateSortValueMap, IsoDateTimeStamp } from '@ukef/dtfs2-common';
import { format, parseISO } from 'date-fns';
import { SHORT_FORM_DATE } from '../../../../constants/date';
import { CompletedCorrectionViewModel } from '../../../../types/view-models/record-correction/record-correction-history';
import { GetCompletedFeeRecordCorrectionsResponseBody } from '../../../../api-response-types';

// TODO FN-3671: Add unit tests.
/**
 * Formats the date sent
 * @param dateSent - The date sent
 * @returns The formatted date
 * @example
 * getFormattedDateSent('2024-01-01T12:30:00.000'); // '01 Jan 2024'
 */
export const getFormattedDateSent = (dateSent: IsoDateTimeStamp): string => format(parseISO(dateSent), SHORT_FORM_DATE);

// TODO FN-3671: TSDOC
// TODO FN-3671: Add unit tests
export const mapCompletedCorrectionsToViewModel = (completedCorrections: GetCompletedFeeRecordCorrectionsResponseBody): CompletedCorrectionViewModel[] => {
  const correctionIdToDateSentDataSortValueMap = getKeyToDateSortValueMap(completedCorrections.map(({ id, dateSent }) => ({ key: id, date: dateSent })));

  return completedCorrections.map((correction) => {
    const { exporter, formattedReasons, formattedPreviousValues, formattedCorrectedValues, bankCommentary } = correction;

    return {
      dateSent: {
        formattedDateSent: getFormattedDateSent(correction.dateSent),
        dataSortValue: correctionIdToDateSentDataSortValueMap[correction.id],
      },
      exporter,
      formattedReasons,
      formattedPreviousValues,
      formattedCorrectedValues,
      bankCommentary,
    };
  });
};
