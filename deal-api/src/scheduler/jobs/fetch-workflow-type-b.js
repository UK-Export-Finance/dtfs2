
const moment = require('moment');

const {
  listDirectoryFiles, readFile, moveFile, getConfig,
} = require('../../drivers/fileshare');
const { processTypeB } = require('../../v1/controllers/integration/type-b.controller');

const fetchWorkflowTypeB = {
  init: () => ({
    schedule: '00,15,30,45 * * * *',
    message: 'Fetch workflow type B every 15 min',
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

      if (!files.length) {
        return false;
      }

      const filePromises = [];
      const filenames = [];

      files.forEach((file) => {
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

      const archiveFolder = `${IMPORT_FOLDER}/archived_v2/${moment().format('YYYY-MM-DD')}`;

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

      console.log(`${files.length} type-b xml files processed`);
      if (errorFiles.length) {
        console.warn(`Error moving ${errorFiles.length} files`);
        errorFiles.forEach(({ reason }) => console.warn(reason.message));
      }

      return files;
    },
  }),
};

module.exports = fetchWorkflowTypeB;
