import { AuditDatabaseRecord, AuditDetails } from '../../types';
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  return { ...baseResponse, auditRecord: generateParsedMockAuditDatabaseRecord(auditObject.auditDetails) };
};
