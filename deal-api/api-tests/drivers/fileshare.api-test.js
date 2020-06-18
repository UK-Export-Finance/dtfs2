jest.unmock('@azure/storage-file-share');

const fileshare = require('../../src/drivers/fileshare');
const { AZURE_PORTAL_FILESHARE_CONFIG } = require('../../src/config/fileshare.config');

const { EXPORT_FOLDER } = AZURE_PORTAL_FILESHARE_CONFIG;

const someXML = '<?xml version="1.0" encoding="UTF-8"?><Deal/>';

const folder = 'api_tests';
const subfolder = 'fileshare';

describe('fileshare', () => {
  it('can upload a string and get it back', async () => {
    await fileshare.uploadFile({
      fileshare: 'portal',
      folder,
      subfolder,
      filename: 'out.xml',
      buffer: Buffer.from(someXML, 'utf-8'),
    }).catch((err) => {
      console.log(err);
    });

    const fileDownload = await fileshare.readFile({
      fileshare: 'portal',
      folder,
      subfolder,
      filename: 'out.xml',
    });

    expect(fileDownload.toString('utf-8')).toEqual(someXML);

    // cleanup
    await fileshare.deleteMultipleFiles([`${EXPORT_FOLDER}/${folder}/${subfolder}/out.xml`]);
  });

  it('uploads and deletes multiple files', async () => {
    const fileList = ['file1.xml', 'file2.xml', 'file3.xml'];

    const fileshareWritePromises = [];
    const fileshareReadPromises = [];

    fileList.forEach((filename) => {
      fileshareWritePromises.push(
        fileshare.uploadFile({
          fileshare: 'portal',
          folder,
          subfolder,
          filename,
          buffer: Buffer.from(someXML, 'utf-8'),
        }),
      );
    });

    await Promise.all(fileshareWritePromises);

    const deleteFileList = fileList.map((filename) => `${EXPORT_FOLDER}/${folder}/${subfolder}/${filename}`);
    await fileshare.deleteMultipleFiles(deleteFileList);

    fileList.forEach((filename) => {
      fileshareReadPromises.push(
        fileshare.readFile({
          fileshare: 'portal',
          folder,
          subfolder,
          filename,
        }),
      );
    });

    const readFiles = await Promise.all(fileshareReadPromises);
    readFiles.forEach((rf) => {
      expect(rf.error).toBeDefined();
      expect(rf.error.errorCode).toEqual(404);
    });
  });
});
