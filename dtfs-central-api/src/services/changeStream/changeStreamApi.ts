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
  const { AUDIT_API_URL, AUDIT_API_USERNAME, AUDIT_API_PASSWORD } = process.env;
  if (!AUDIT_API_URL || !AUDIT_API_USERNAME || !AUDIT_API_PASSWORD) {
    throw new InvalidEnvironmentVariableError('AUDIT_API_URL, AUDIT_API_USERNAME or AUDIT_API_PASSWORD not set');
  }
  console.info(123123123);
  console.info(changeStreamDocument);
  if (changeStreamDocument.operationType !== 'insert' && changeStreamDocument.operationType !== 'update' && changeStreamDocument.operationType !== 'replace') {
    console.info('Change stream document is not suitable event for audit API, skipping');
    return;
  }

  const { fullDocument } = changeStreamDocument;
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
    data: fullDocument,
  });
};
