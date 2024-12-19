import { FeeRecordEntityMockBuilder, mapReasonsToDisplayValues, mockFeeRecordCorrection, uploadedUtilisationReportMock } from '@ukef/dtfs2-common';
import { format } from 'date-fns';
import { getRecordCorrectionDetails } from './get-record-correction-details';
import { aPortalUser } from '../../../../../../test-helpers';

describe('get-record-correction-details', () => {
  const reportId = 1;
  const feeRecordId = 11;

  const portalUser = aPortalUser();
  const portalUserId = portalUser._id.toString();

  const bankId = '123';

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('when no record corrections are provided', () => {
    const uploadedUtilisationReport = uploadedUtilisationReportMock(reportId, portalUserId, bankId);
    const feeRecord = FeeRecordEntityMockBuilder.forReport(uploadedUtilisationReport).withId(feeRecordId).withCorrections([]).build();
    uploadedUtilisationReport.feeRecords = [feeRecord];

    it('should return an empty array if no corrections are provided', () => {
      const result = getRecordCorrectionDetails(uploadedUtilisationReport.feeRecords);

      expect(result).toEqual([]);
    });
  });

  describe('when a record correction is provided', () => {
    const uploadedUtilisationReport = uploadedUtilisationReportMock(reportId, portalUserId, bankId);
    const feeRecordWithCorrections = FeeRecordEntityMockBuilder.forReport(uploadedUtilisationReport)
      .withId(feeRecordId)
      .withCorrections([mockFeeRecordCorrection])
      .build();
    uploadedUtilisationReport.feeRecords = [feeRecordWithCorrections];

    it('should return an empty array if no corrections are provided', () => {
      const result = getRecordCorrectionDetails(uploadedUtilisationReport.feeRecords);

      const reasonsArray = mapReasonsToDisplayValues(feeRecordWithCorrections.corrections[0].reasons);

      const expected = [
        {
          feeRecordId: feeRecordWithCorrections.id,
          facilityId: feeRecordWithCorrections.facilityId,
          exporter: feeRecordWithCorrections.exporter,
          status: feeRecordWithCorrections.status,
          reasons: `${reasonsArray[0]}, ${reasonsArray[1]}`,
          dateSent: format(feeRecordWithCorrections.corrections[0].dateRequested, 'dd MMM yyyy'),
          requestedBy: `${feeRecordWithCorrections.corrections[0].requestedByUser.firstName} ${feeRecordWithCorrections.corrections[0].requestedByUser.lastName}`,
        },
      ];
      expect(result).toEqual(expected);
    });
  });
});
