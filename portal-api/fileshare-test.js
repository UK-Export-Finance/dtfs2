const { ShareServiceClient, StorageSharedKeyCredential } = require('@azure/storage-file-share');

const AZURE_WORKFLOW_FILESHARE_CONFIG = {
  STORAGE_ACCOUNT: 'tfsandrew',
  STORAGE_ACCESS_KEY: '8L84g4mYvH9KobbyiPDM/xDETBv57SZAvTxTfupwpRozhZG2jqNQMPowSxncw9iqz4CiLoqspK7wA5QytWNAOQ==',
  FILESHARE_NAME: 'portal',
};

const stringToSign = 'GET\n\n\n\nx-ms-date: Fri, 11 Jan 2021 11:17:12 GMT\nx-ms-version: 2019-07-07\nx-ms-client-request-id: b4c3549d-ddd8-4031-879b-4e54bbac92cc';
const getCredentials = async () => {
  const {
    STORAGE_ACCOUNT, STORAGE_ACCESS_KEY,
  } = AZURE_WORKFLOW_FILESHARE_CONFIG;

  console.log({ STORAGE_ACCOUNT, STORAGE_ACCESS_KEY });
  const credentials = await new StorageSharedKeyCredential(STORAGE_ACCOUNT, STORAGE_ACCESS_KEY);

  // return credentials.computeHMACSHA256(stringToSign);
  return credentials;
};

const getShareClient = async () => {
  const credentials = await getCredentials();
  const { STORAGE_ACCOUNT, FILESHARE_NAME } = AZURE_WORKFLOW_FILESHARE_CONFIG;
  console.log({ STORAGE_ACCOUNT, FILESHARE_NAME });
  const serviceClient = new ShareServiceClient(
    `https://${STORAGE_ACCOUNT}.file.core.windows.net`,
    credentials,
  );

  /*
  if (process.env.AZURE_LOG_LEVEL) {
    console.log('get Share props');
    const shareProps = await serviceClient.getProperties();
    console.log({ shareProps });
  }
  */

  const shareClient = await serviceClient.getShareClient(FILESHARE_NAME);
  console.log('getShareClient', { shareClient });

  await shareClient.create().catch(({ details }) => {
    console.log({ details });
    if (!details) return;
    if (details.errorCode === 'ShareAlreadyExists') return;
    throw new Error(details.message);
  });

  return shareClient;
};

const test = async () => {
  const shareClient = await getShareClient();
  console.log('test', { shareClient });
};

test();
