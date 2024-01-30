import axios from 'axios';
import { ChangeStreamDocument } from 'mongodb';

export const postAuditDetails: (changeStreamDocument: ChangeStreamDocument) => Promise<void> = async (changeStreamDocument: ChangeStreamDocument) => {
  try {
    if (!process.env.AUDIT_API_URL) {
      console.error('Not updating audit API, AUDIT_API_URL not set');
      return;
    }
    let documentId;
    let collectionName;
    let fullDocument;
    if ('documentKey' in changeStreamDocument) {
      documentId = changeStreamDocument.documentKey._id.toString();
    }
    if ('ns' in changeStreamDocument) {
      const {ns} = changeStreamDocument;
      if ('coll' in ns) {
        collectionName = ns.coll;
      }
    }
    if ('fullDocument' in changeStreamDocument) {
      fullDocument = changeStreamDocument.fullDocument;
    }

    // The change stream supports multiple operations, but we only want to send
    // updates to documents to the audit API when they are updated
    if (!documentId || !collectionName || !fullDocument) {
      console.info('Change stream document is not for a document update, skipping');
      return;
    }

    await axios({
      method: 'post',
      url: `${process.env.AUDIT_API_URL}`,
      headers: {
        Authorization: `Bearer ${process.env.AUDIT_API_BEARER_TOKEN}`,
        integrationHubItemId: documentId,
        integrationHubCollectionName: collectionName,
        integrationHubProcess: 'dtfs',
        'Content-Type': 'application/json',
      },
      data: fullDocument,
    });
  } catch (error) {
    console.error('Error sending change stream update to API', error);
    throw error;
  }
};
