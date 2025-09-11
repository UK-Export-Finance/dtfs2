import { RestError } from '@azure/storage-file-share';

// https://learn.microsoft.com/en-us/dotnet/api/azure.storage.files.shares.models.shareerrorcode?view=azure-dotnet
export const AZURE_STORAGE_SHARE_ERROR_CODE = {
  PARENT_NOT_FOUND: 'ParentNotFound',
};

export const isParentNotFoundError = (error: unknown): boolean =>
  error instanceof RestError &&
  typeof error.details === 'object' &&
  !!error.details &&
  'errorCode' in error.details &&
  error.details.errorCode === AZURE_STORAGE_SHARE_ERROR_CODE.PARENT_NOT_FOUND;
