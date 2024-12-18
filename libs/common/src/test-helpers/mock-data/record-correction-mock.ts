import { FeeRecordEntityMockBuilder } from './fee-record.entity.mock-builder';
import { REQUEST_PLATFORM_TYPE, RECORD_CORRECTION_REASON, FEE_RECORD_STATUS } from '../../constants';
import { RequestedByUser, FeeRecordCorrection } from '../../types';
import { DbRequestSource, FeeRecordCorrectionEntity } from '../../sql-db-entities';
import { uploadedUtilisationReportMock } from './uploaded-utilisation-report-mock';

const reportId = 1;
const feeRecordId = 11;

const portalUserId = '123';
const bankId = '123';

const uploadedUtilisationReport = uploadedUtilisationReportMock(reportId, portalUserId, bankId);

const feeRecord = FeeRecordEntityMockBuilder.forReport(uploadedUtilisationReport).withId(feeRecordId).withCorrections([]).build();

const reasons = [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.OTHER];

const additionalInfo = 'additional information for the correction';

const requestedByUser: RequestedByUser = {
  id: 'def456',
  firstName: 'Jane',
  lastName: 'Smith',
};

const requestSource: DbRequestSource = {
  userId: 'abc123',
  platform: REQUEST_PLATFORM_TYPE.TFM,
};

/**
 * Mock data for fee record correction creation
 * Creates fee record correction for fee record
 */
export const mockFeeRecordCorrection = FeeRecordCorrectionEntity.createRequestedCorrection({
  feeRecord,
  requestedByUser,
  reasons,
  additionalInfo,
  requestSource,
});

/**
 * Mock data for fee record correction details
 * Created in dtfs-central-api and requested by tfm
 */
export const mockRecordCorrectionDetails = [
  {
    feeRecordId: 12,
    facilityId: '456',
    exporter: 'test exporter',
    reasons: RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT,
    dateSent: new Date().toISOString(),
    requestedBy: 'mock name',
    status: FEE_RECORD_STATUS.PENDING_CORRECTION,
  },
] as FeeRecordCorrection[];
