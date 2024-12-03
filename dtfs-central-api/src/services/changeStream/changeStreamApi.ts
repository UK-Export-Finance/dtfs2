import axios from 'axios';
import { ChangeStreamUpdateDocument, ChangeStreamInsertDocument, ChangeStreamReplaceDocument, ObjectId } from 'mongodb';
import { DeletionAuditLog, AuditDatabaseRecord } from '@ukef/dtfs2-common';
import { InvalidEnvironmentVariableError } from '../../errors/invalid-environment-variable.error';

type DeletionAuditRecord = {
  deletedAt: string;
  deletedByIsSystem: boolean | null;
  deletedByPortalUserId: ObjectId | null;
  deletedByTfmUserId: ObjectId | null;
  deletedByNoUserLoggedIn: boolean | null;
};

/**
 * Checks whether the document is a document that needs to be sent to the audit API
 * and sends it if it is
 * @param changeStreamDocument Change Stream Document event from mongodb API
 * @returns
 */
export const postAuditDetails = async (
  changeStreamDocument: ChangeStreamInsertDocument | ChangeStreamUpdateDocument | ChangeStreamReplaceDocument,
): Promise<void> => {
  const { AUDIT_API_URL, AUDIT_API_USERNAME, AUDIT_API_PASSWORD } = process.env;
  if (!AUDIT_API_URL || !AUDIT_API_USERNAME || !AUDIT_API_PASSWORD) {
    throw new InvalidEnvironmentVariableError('AUDIT_API_URL, AUDIT_API_USERNAME or AUDIT_API_PASSWORD not set');
  }
  console.info('Sending change stream update to API for document', changeStreamDocument);

  const authorizationHeader = Buffer.from(`${AUDIT_API_USERNAME}:${AUDIT_API_PASSWORD}`).toString('base64');
  await axios({
    method: 'post',
    url: `${AUDIT_API_URL}`,
    headers: {
      Authorization: `Basic ${authorizationHeader}`,
      integrationHubItemId: changeStreamDocument.documentKey._id.toString(),
      integrationHubCollectionName: changeStreamDocument.ns.coll,
      integrationHubProcess: 'dtfs',
      Accept: 'application/json',
      'Content-Type': 'text/plain',
    },
    data: changeStreamDocument.fullDocument,
  });
};

const mapDeletionAuditRecord = (auditRecord: AuditDatabaseRecord): DeletionAuditRecord => ({
  deletedAt: auditRecord.lastUpdatedAt,
  deletedByIsSystem: auditRecord.lastUpdatedByIsSystem,
  deletedByPortalUserId: auditRecord.lastUpdatedByPortalUserId,
  deletedByTfmUserId: auditRecord.lastUpdatedByTfmUserId,
  deletedByNoUserLoggedIn: auditRecord.noUserLoggedIn,
});

/**
 * When deleting a document from the database, we can't just add the `AuditDetails` to the document itself. To solve this, when a document
 * is deleted, a log is inserted to `deletion-audit-logs` containing the metadata we want to send. The deletion logs collection has its
 * own separate change stream, calling this function to map the log & post it to the api.
 */
export const postDeletionAuditDetails = async (changeStreamDocument: ChangeStreamInsertDocument<DeletionAuditLog>): Promise<void> => {
  const { AUDIT_API_URL, AUDIT_API_USERNAME, AUDIT_API_PASSWORD } = process.env;
  if (!AUDIT_API_URL || !AUDIT_API_USERNAME || !AUDIT_API_PASSWORD) {
    throw new InvalidEnvironmentVariableError('AUDIT_API_URL, AUDIT_API_USERNAME or AUDIT_API_PASSWORD not set');
  }
  console.info('Sending change stream update to API for deletion document', changeStreamDocument);

  const authorizationHeader = Buffer.from(`${AUDIT_API_USERNAME}:${AUDIT_API_PASSWORD}`).toString('base64');
  await axios({
    method: 'post',
    url: `${AUDIT_API_URL}`,
    headers: {
      Authorization: `Basic ${authorizationHeader}`,
      integrationHubItemId: changeStreamDocument.fullDocument.deletedDocumentId.toString(),
      integrationHubCollectionName: changeStreamDocument.fullDocument.collectionName,
      integrationHubProcess: 'dtfs',
      Accept: 'application/json',
      'Content-Type': 'text/plain',
    },
    data: {
      auditRecord: mapDeletionAuditRecord(changeStreamDocument.fullDocument.auditRecord),
    },
  });
};
