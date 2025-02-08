import { GetRecordCorrectionLogDetailsResponseBody } from '../../types';

export const recordCorrectionLogDetailsMock: GetRecordCorrectionLogDetailsResponseBody = {
  correctionDetails: {
    facilityId: '1',
    exporter: 'Test exporter',
    formattedReasons: 'Reason 1, Reason 2',
    formattedDateSent: '01 Jan 2021',
    formattedOldRecords: 'Old records',
    formattedCorrectRecords: 'Correct records',
    isCompleted: true,
    bankTeamName: 'Test bank team',
    formattedBankTeamEmails: 'test@ukexportfinance.gov.uk',
    additionalInfo: '123',
    formattedBankCommentary: '-',
    formattedDateReceived: '-',
    formattedRequestedByUser: 'test name',
  },
  bankName: 'test bank',
  reportPeriod: {
    start: { month: 1, year: 2023 },
    end: { month: 1, year: 2023 },
  },
};
