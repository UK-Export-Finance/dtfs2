import { AzureFileInfoEntity } from "@ukef/dtfs2-common";

export const anAzureFileInfoEntity = (): AzureFileInfoEntity => {
  const fileInfo = new AzureFileInfoEntity();
  fileInfo.folder = 'folder';
  fileInfo.filename = 'filename';
  fileInfo.fullPath = 'fullpath';
  fileInfo.url = 'url';
  fileInfo.mimetype = 'mimetype';
  fileInfo.updatedByUserId = 'SYSTEM';
  return fileInfo;
};