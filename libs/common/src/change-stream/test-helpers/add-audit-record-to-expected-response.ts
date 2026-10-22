import { AuditDatabaseRecord, AuditDetails } from '@ukef/types';
import { generateParsedMockAuditDatabaseRecord } from './generate-mock-audit-database-record';

type AddAuditRecordToResponseParams =
  | {
      baseResponse: object;
      auditRecord: AuditDatabaseRecord;
    }
  | {
      baseResponse: object;
      auditDetails: AuditDetails;
    };

export const addAuditRecordToExpectedResponse = ({ baseResponse, ...auditObject }: AddAuditRecordToResponseParams) => {
  if ('auditRecord' in auditObject) {
    return {
      ...baseResponse,
      auditRecord: auditObject.auditRecord,
    };
  }

  return { ...baseResponse, auditRecord: generateParsedMockAuditDatabaseRecord(auditObject.auditDetails) };
};
