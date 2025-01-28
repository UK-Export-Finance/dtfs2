import { RECORD_CORRECTION_REASON } from '../../constants';

export const feeRecordCorrectionRequestReviewResponseBodyMock = {
  bank: { id: '123', name: 'Test bank' },
  reportPeriod: {
    start: { month: 1, year: 2024 },
    end: { month: 1, year: 2024 },
  },
  correctionRequestDetails: {
    facilityId: '0012345678',
    exporter: 'A sample exporter',
    reasons: [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT],
    additionalInfo: 'this is the reason',
    contactEmailAddresses: ['test@test.com'],
  },
};
