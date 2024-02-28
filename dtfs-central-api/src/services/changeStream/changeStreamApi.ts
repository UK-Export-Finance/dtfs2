import axios from 'axios';
import { ChangeStreamDocument } from 'mongodb';

/**
 * Checks whether the document is a document that needs to be sent to the audit API
 * and sends it if it is
 * @param changeStreamDocument Change Stream Document event from mongodb API
 * @returns
 */
export const postAuditDetails: (changeStreamDocument: ChangeStreamDocument) => Promise<void> = async (changeStreamDocument: ChangeStreamDocument) => {
  try {
    if (!process.env.AUDIT_API_URL || !process.env.AUDIT_API_USERNAME || !process.env.AUDIT_API_PASSWORD) {
      console.error('Not updating audit API, audit API env var missing');
      return;
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
        Accept: 'application/json',
        'Content-Type': 'text/plain',
      },
      data: fullDocument,
    });
  } catch (error) {
    console.error('Error sending change stream update to API', error);
    throw error;
  }
};
