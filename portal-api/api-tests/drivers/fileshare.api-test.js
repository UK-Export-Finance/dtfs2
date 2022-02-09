jest.unmock('@azure/storage-file-share');

const fileshare = require('../../src/drivers/fileshare');

const someXML = '<?xml version="1.0" encoding="UTF-8"?><Deal/>';
const someXML2 = '<?xml version="1.0" encoding="UTF-8"?>XML2<Deal/>';


const folder = 'api_tests/fileshare';
const fileshareName = 'portal';

// Fileshare tests are not picking up Azure env variables. Disbabling for time being
xdescribe('fileshare', () => {
  describe('uploads', () => {
    const filename = 'test-file.xml';

    beforeEach(async () => {
      await fileshare.deleteMultipleFiles(fileshare, `${folder}/${filename}`);
    });

    it('can upload a string and get it back', async () => {
      await fileshare.uploadFile({
        fileshare: fileshareName,
        folder,
        filename,
        buffer: Buffer.from(someXML, 'utf-8'),
      }).catch((err) => {
        console.error(err);
      });

      const fileDownload = await fileshare.readFile({
        fileshare: fileshareName,
        folder,
        filename,
      });

      expect(fileDownload.toString('utf-8')).toEqual(someXML);

      // cleanup
      await fileshare.deleteMultipleFiles(fileshare, folder, filename);
      const readFile = await fileshare.readFile({
        fileshare: fileshareName,
        folder,
        filename,
      });
      expect(readFile.error).toBeDefined();
      expect(readFile.error.errorCode).toEqual(404);
    });
  });

  describe('multiple uploads', () => {
    const fileList = ['file1.xml', 'file2.xml', 'file3.xml'];

    beforeEach(async () => {
      await fileshare.deleteMultipleFiles(fileshare, folder, fileList);
    });

    it('uploads and deletes multiple files', async () => {
      const fileshareWritePromises = [];
      const fileshareReadPromises = [];

      fileList.forEach((filename) => {
        fileshareWritePromises.push(
          fileshare.uploadFile({
            fileshare: fileshareName,
            folder,
            filename,
            buffer: Buffer.from(someXML, 'utf-8'),
          }),
        );
      });

      await Promise.all(fileshareWritePromises);


      await fileshare.deleteMultipleFiles(fileshareName, folder, fileList);

      fileList.forEach((filename) => {
        fileshareReadPromises.push(
          fileshare.readFile({
            fileshare: fileshareName,
            folder,
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


  describe('Upload existing files', () => {
    const filename = 'duplicate.xml';

    afterEach(async () => {
      await fileshare.deleteMultipleFiles(fileshare, folder, [filename]);
    });

    it('returns error if trying to upload a file that already exists', async () => {
      await fileshare.uploadFile({
        fileshare: fileshareName,
        folder,
        filename,
        buffer: Buffer.from(someXML, 'utf-8'),
      });

      const duplicateFile = await fileshare.uploadFile({
        fileshare: fileshareName,
        folder,
        filename,
        buffer: Buffer.from(someXML, 'utf-8'),
      });

      expect(duplicateFile.error.message).toEqual('could not be uploaded. Each file must have unique filename');
    });


    it('allows overwrite of file that already exists if flag set', async () => {
      await fileshare.uploadFile({
        fileshare: fileshareName,
        folder,
        filename,
        buffer: Buffer.from(someXML, 'utf-8'),
      });

      const duplicateFile = await fileshare.uploadFile({
        fileshare: fileshareName,
        folder,
        filename,
        buffer: Buffer.from(someXML2, 'utf-8'),
        allowOverwrite: true,
      });

      const fileDownload = await fileshare.readFile({
        fileshare: fileshareName,
        folder,
        filename,
      });

      expect(duplicateFile.fullPath).toEqual(`${folder}/${filename}`);
      expect(fileDownload.toString('utf-8')).toEqual(someXML2);
    });
  });

  describe('parent folders', () => {
    const randomFolderName = Date.now();

    const nonExistentFolder = `${folder}/${randomFolderName}`;
    const nonExistentSubFolder = `${nonExistentFolder}/${randomFolderName + 1}`;

    afterEach(async () => {
      try {
        await fileshare.deleteMultipleFiles(fileshare, nonExistentSubFolder, ['out.xml']).then(async () => {
          await fileshare.deleteDirectory(fileshare, nonExistentSubFolder).then(() => {
            fileshare.deleteDirectory(fileshare, nonExistentFolder);
          });
        });
      } catch (e) { return false; }
    });

    it('creates parent folders if they don\'t exist', async () => {
      await fileshare.uploadFile({
        fileshare: fileshareName,
        folder: nonExistentSubFolder,
        filename: 'out.xml',
        buffer: Buffer.from(someXML, 'utf-8'),
      }).catch((err) => {
        console.error(err);
      });

      const fileDownload = await fileshare.readFile({
        fileshare: fileshareName,
        folder: nonExistentSubFolder,
        filename: 'out.xml',
      });

      expect(fileDownload.toString('utf-8')).toEqual(someXML);
    });
  });

  describe('copy files', () => {
    const filename = 'original-file.xml';
    const copiedFilename = 'copied-file.xml';

    afterEach(async () => {
      await fileshare.deleteMultipleFiles(fileshare, folder, [filename, copiedFilename]);
    });

    it('copies file from one location to another', async () => {
      const fromFile = {
        fileshare: fileshareName,
        folder,
        filename,
        buffer: Buffer.from(someXML, 'utf-8'),
      };

      const toFile = {
        fileshare: fileshareName,
        folder,
        filename: copiedFilename,
        buffer: Buffer.from(someXML, 'utf-8'),
      };

      await fileshare.uploadFile(fromFile).catch((err) => {
        console.error(err);
      });

      const copy = await fileshare.copyFile({
        from: fromFile,
        to: toFile,
      });

      expect(copy.fullPath).toEqual(`${folder}/copied-file.xml`);

      const fromDownload = await fileshare.readFile(fromFile);
      const toDownload = await fileshare.readFile(toFile);

      expect(fromDownload.toString('utf-8')).toEqual(someXML);
      expect(toDownload.toString('utf-8')).toEqual(someXML);
    });

    it('returns error if trying to copy file that doesn\'t exist', async () => {
      const fromFile = {
        fileshare: fileshareName,
        folder,
        filename,
        buffer: Buffer.from(someXML, 'utf-8'),
      };

      const toFile = {
        fileshare: fileshareName,
        folder,
        filename: copiedFilename,
        buffer: Buffer.from(someXML, 'utf-8'),
      };


      const copy = await fileshare.copyFile({
        from: fromFile,
        to: toFile,
      });

      expect(copy.error.errorCode).toEqual(404);
    });

    it('moves file from one location to another', async () => {
      const fromFile = {
        fileshare: fileshareName,
        folder,
        filename,
        buffer: Buffer.from(someXML, 'utf-8'),
      };

      const toFile = {
        fileshare: fileshareName,
        folder,
        filename: copiedFilename,
        buffer: Buffer.from(someXML, 'utf-8'),
      };

      await fileshare.uploadFile(fromFile).catch((err) => {
        console.error(err);
      });

      const copy = await fileshare.moveFile({
        from: fromFile,
        to: toFile,
      });

      expect(copy.fullPath).toEqual(`${folder}/copied-file.xml`);

      const fromDownload = await fileshare.readFile(fromFile);
      const toDownload = await fileshare.readFile(toFile);

      expect(fromDownload.error).toBeDefined();
      expect(fromDownload.error.errorCode).toEqual(404);
      expect(toDownload.toString('utf-8')).toEqual(someXML);
    });

    it('returns error if trying to move non-existent file', async () => {
      const fromFile = {
        fileshare: fileshareName,
        folder,
        filename,
        buffer: Buffer.from(someXML, 'utf-8'),
      };

      const toFile = {
        fileshare: fileshareName,
        folder,
        filename: copiedFilename,
        buffer: Buffer.from(someXML, 'utf-8'),
      };

      try {
        await fileshare.moveFile({
          from: fromFile,
          to: toFile,
        });
      } catch (err) {
        expect(err.message).toContain(filename);
      }
    });
  });

  describe('list directory', () => {
    const fileList = ['file1.xml', 'file2.xml', 'file3.xml'];
    const listFolder = `${folder}/list-files`;

    beforeEach(async () => {
      await fileshare.deleteMultipleFiles(fileshareName, listFolder, fileList);
    });


    it('list files in a directory', async () => {
      const fileshareWritePromises = [];

      fileList.forEach((filename) => {
        fileshareWritePromises.push(
          fileshare.uploadFile({
            fileshare: fileshareName,
            folder: listFolder,
            filename,
            buffer: Buffer.from(someXML, 'utf-8'),
          }),
        );
      });

      await Promise.all(fileshareWritePromises);

      const listDir = await fileshare.listDirectoryFiles({ fileshare: fileshareName, folder: listFolder });
      const listFileMap = listDir.map((file) => file.name);
      expect(listFileMap).toMatchObject(fileList);
    });
  });
});
