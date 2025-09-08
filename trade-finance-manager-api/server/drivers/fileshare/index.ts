import { Buffer } from 'buffer';
import path from 'path';
import { FileshareConfig } from '@ukef/dtfs2-common';
import { ShareServiceClient, StorageSharedKeyCredential } from '@azure/storage-file-share';
import { FILESHARES } from '../../constants';
import { AZURE_UTILISATION_REPORTS_FILESHARE_CONFIG } from '../../config/fileshare.config';
import { Fileshare } from '../../types/fileshare';
import { isParentNotFoundError } from './error-helper';

const getConfig = (fileshare: Fileshare): FileshareConfig => {
  switch (fileshare) {
    case FILESHARES.UTILISATION_REPORTS:
      return AZURE_UTILISATION_REPORTS_FILESHARE_CONFIG;
    default:
      throw new Error('Unable to get config - unsupported fileshare', fileshare);
  }
};

const getCredentials = (fileshare: Fileshare) => {
  const { STORAGE_ACCOUNT, STORAGE_ACCESS_KEY } = getConfig(fileshare);
  return new StorageSharedKeyCredential(STORAGE_ACCOUNT, STORAGE_ACCESS_KEY);
};

const getShareClientAndCreateIfNotExists = async (fileshare: Fileshare) => {
  const credentials = getCredentials(fileshare);
  const { STORAGE_ACCOUNT, FILESHARE_NAME } = getConfig(fileshare);
  const serviceClient = new ShareServiceClient(`https://${STORAGE_ACCOUNT}.file.core.windows.net`, credentials);
  const shareClient = serviceClient.getShareClient(FILESHARE_NAME);
  await shareClient.createIfNotExists();
  return shareClient;
};

const getDirectoryAndCreateIfNotExists = async (fileshare: Fileshare, folderPath: string) => {
  const shareClient = await getShareClientAndCreateIfNotExists(fileshare);
  const directoryClient = shareClient.getDirectoryClient(folderPath);

  try {
    await directoryClient.createIfNotExists();
  } catch (error) {
    if (isParentNotFoundError(error)) {
      const parentFolderPath = path.dirname(folderPath);
      await getDirectoryAndCreateIfNotExists(fileshare, parentFolderPath);
      await directoryClient.createIfNotExists();
    } else {
      throw error;
    }
  }

  return directoryClient;
};

type ReadFileParams = {
  fileshare: Fileshare;
  folder: string;
  filename: string;
};

export const readFile = async ({ fileshare, folder, filename }: ReadFileParams): Promise<Buffer> => {
  const directory = await getDirectoryAndCreateIfNotExists(fileshare, folder);
  const fileClient = directory.getFileClient(`${filename}`);
  return await fileClient.downloadToBuffer();
};

export default { readFile };
