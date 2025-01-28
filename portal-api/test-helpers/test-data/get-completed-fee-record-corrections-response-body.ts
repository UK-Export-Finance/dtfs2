import { GetCompletedFeeRecordCorrectionsResponseBody } from '../../src/v1/api-response-types';

export const aGetCompletedFeeRecordCorrectionsResponseBody = (): GetCompletedFeeRecordCorrectionsResponseBody => [
  {
    id: 7,
    dateSent: '2024-01-01T12:00:00Z',
    exporter: 'A sample exporter',
    formattedReasons: 'Reason 1, Reason 2',
    formattedPreviousValues: 'previousValue1, previousValue2',
    formattedCorrectedValues: 'newValue1, newValue2',
    bankCommentary: 'Some bank commentary',
  },
];
