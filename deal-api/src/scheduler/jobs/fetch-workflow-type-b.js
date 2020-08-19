
const moment = require('moment');

const {
  listDirectoryFiles, readFile, moveFile, getConfig, uploadFile, deleteFile,
} = require('../../drivers/fileshare');
const { processTypeB } = require('../../v1/controllers/integration/type-b.controller');

const fetchWorkflowTypeB = {
  init: () => ({
    schedule: '*/1 * * * * *',
    message: 'Fetch workflow type B every 1 second',
    task: async (fileshare = 'workflow', overwriteFolder) => {
      const { IMPORT_FOLDER } = getConfig(fileshare);

      const workflowImportFolder = {
        fileshare,
        folder: overwriteFolder || IMPORT_FOLDER,
      };

      const folderContents = await listDirectoryFiles(workflowImportFolder);
      if (!folderContents) {
        return false;
      }

      const files = folderContents.filter((f) => f.kind === 'file');

      const workflowLockfileExists = files.find((f) => f.name === 'workflow.lock');

      if (!files.length || workflowLockfileExists) {
        return false;
      }

      const filePromises = [];
      const filenames = [];

      const lockFile = {
        fileshare: 'workflow',
        folder: IMPORT_FOLDER,
        filename: 'portal.lock',
        buffer: Buffer.from('', 'utf-8'),
      };

      await uploadFile(lockFile);

      files.filter((f) => f.name.toLowerCase().endsWith('xml')).forEach((file) => {
        const documentLocation = {
          fileshare,
          folder: IMPORT_FOLDER,
          filename: file.name,
          importFolder: true,
        };

        const bufferedFile = readFile(documentLocation);

        filePromises.push(bufferedFile);
        filenames.push({ filename: file.name });
      });

      const fileXml = await Promise.all(filePromises);

      const fileContents = filenames.map((fileinfo, index) => ({
        ...fileinfo,
        fileContents: fileXml[index].toString('utf16le'),
      }));

      fileContents.forEach((xmlFile) => {
        processTypeB(xmlFile);
      });

      const moveFilePromises = [];

      const archiveFolder = `${IMPORT_FOLDER}/archived/${moment().format('YYYY-MM-DD')}`;

      filenames.forEach(({ filename }) => {
        const from = {
          fileshare,
          folder: IMPORT_FOLDER,
          filename,
        };

        const to = {
          fileshare,
          folder: archiveFolder,
          filename,
        };

        moveFilePromises.push(moveFile({ to, from }));
      });

      const moveFiles = await Promise.allSettled(moveFilePromises);
      const errorFiles = moveFiles.filter((mf) => mf.status === 'rejected');

      await deleteFile('workflow', `${lockFile.folder}/${lockFile.filename}`);

      if (errorFiles.length) {
        errorFiles.forEach(({ reason }) => console.warn(reason.message));
      }

      return files;
    },
  }),
};

module.exports = fetchWorkflowTypeB;
