import axios from 'axios';
import { ChangeStreamDocument } from 'mongodb';
import { InvalidEnvironmentVariableError } from '../../errors/invalid-environment-variable.error';

/**
 * Checks whether the document is a document that needs to be sent to the audit API
 * and sends it if it is
 * @param changeStreamDocument Change Stream Document event from mongodb API
 * @returns
 */
export const postAuditDetails: (changeStreamDocument: ChangeStreamDocument) => Promise<void> = async (changeStreamDocument: ChangeStreamDocument) => {
  if (!process.env.AUDIT_API_URL || !process.env.AUDIT_API_USERNAME || !process.env.AUDIT_API_PASSWORD) {
    throw new InvalidEnvironmentVariableError('AUDIT_API_URL, AUDIT_API_USERNAME or AUDIT_API_PASSWORD not set');
  }
  if (
    changeStreamDocument.operationType !== 'insert' &&
    changeStreamDocument.operationType !== 'update' &&
    changeStreamDocument.operationType !== 'replace' &&
    changeStreamDocument.operationType !== 'delete'
  ) {
    console.info('Change stream document is not suitable event for audit API, skipping');
    return;
  }

  const fullDocument = changeStreamDocument.operationType !== 'delete' ? changeStreamDocument.fullDocument : null;
  console.info('Sending change stream update to API for document', changeStreamDocument);

  const authorizationHeader = Buffer.from(`${process.env.AUDIT_API_USERNAME}:${process.env.AUDIT_API_PASSWORD}`).toString('base64');
  await axios({
    method: 'post',
    url: `${process.env.AUDIT_API_URL}`,
    headers: {
      Authorization: `Basic ${authorizationHeader}`,
      integrationHubItemId: changeStreamDocument.documentKey._id.toString(),
      integrationHubCollectionName: changeStreamDocument.ns.coll,
      integrationHubProcess: 'dtfs',
      'Content-Type': 'application/json',
    },
    data: fullDocument,
  });
};
