// mock storage-file-share copied from `portal-api/__mocks__/@azure/storage-file-share.js`

const { RestError, StorageSharedKeyCredential, ShareServiceClient, ShareClient, ShareDirectoryClient, ShareFileClient } =
  jest.genMockFromModule('@azure/storage-file-share');

function createDirectoryClient(folder) {
  const directory = new ShareDirectoryClient();
  directory.folderName = this.folderName ? `${this.folderName}/${folder}` : folder;
  return directory;
}

function createFileClient(filename) {
  const fileClient = new ShareFileClient();
  fileClient.name = filename;
  fileClient.path = `${this.folderName}/${filename}`;
  fileClient.downloadToBuffer = () => {
    if (filename === 'not-found.txt') {
      return {
        error: {
          errorCode: 404,
        },
      };
    }

    return Buffer.from('mockFile', 'utf-8');
  };
  fileClient.getProperties = () => ({
    catch: () => {},
  });
  return fileClient;
}

ShareDirectoryClient.catch = jest.fn;
ShareDirectoryClient.prototype.create = () => ShareDirectoryClient;
ShareDirectoryClient.prototype.getDirectoryClient = createDirectoryClient;
ShareDirectoryClient.prototype.getFileClient = createFileClient;

ShareClient.catch = jest.fn;
ShareClient.prototype.create = () => ShareClient;
ShareClient.prototype.deleteFile = () => ShareClient;
ShareClient.prototype.getDirectoryClient = createDirectoryClient;
ShareClient.prototype.ShareClientdeleteFile = () => ShareClient;

ShareServiceClient.prototype.getShareClient = () => {
  const shareClient = new ShareClient();
  shareClient.url = 'mockurl/share';
  return shareClient;
};

module.exports = {
  RestError,
  StorageSharedKeyCredential,
  ShareServiceClient,
};
