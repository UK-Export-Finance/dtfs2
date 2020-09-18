const moment = require('moment');

const defaultSchedule = '*/1 * * * * *';
const schedule = process.env.FETCH_WORKFLOW_TYPE_B_SCHEDULE || defaultSchedule;

console.log(`defining fetch-workflow-type-b schedule: ${schedule}`);

const {
  listDirectoryFiles, readFile, moveFile, getConfig, uploadFile, deleteFile,
} = require('../../drivers/fileshare');
const { processTypeB } = require('../../v1/controllers/integration/type-b.controller');

const fetchWorkflowTypeB = {
  init: () => ({
    schedule,
    message: 'Fetch workflow type B as configured by FETCH_WORKFLOW_TYPE_B_SCHEDULE',
    task: async (fileshare = 'workflow', overwriteFolder) => {
      const { IMPORT_FOLDER } = getConfig(fileshare);

      const workflowImportFolder = {
        fileshare,
        folder: overwriteFolder || IMPORT_FOLDER,
      };

      const lockFile = {
        fileshare: 'workflow',
        folder: IMPORT_FOLDER,
        filename: 'portal.lock',
        buffer: Buffer.from('', 'utf-8'),
      };

      const folderContents = await listDirectoryFiles(workflowImportFolder);
      if (!folderContents) {
        return false;
      }

      const files = folderContents.filter((f) => f.kind === 'file');

      const lockfileExists = files.some((f) => ['workflow.lock', lockFile.filename].includes(f.name));

      if (!files.length || lockfileExists) {
        return false;
      }

      const filePromises = [];
      const filenames = [];


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

      const processList = [];

      for (let i = 0; i < fileContents.length; i++) {
        const processedTypeB = await processTypeB(fileContents[i]).catch(() => ({
          filename: fileContents[[i]].filename,
          success: false,
        })).then((processedTypeB) => {
          processList.push(processedTypeB);
        });
      }

      const processErrorFiles = processList.filter((pl) => !pl.success).map(({ filename }) => filename);

      const moveFilePromises = [];

      const archiveFolder = `${IMPORT_FOLDER}/archived/${moment().format('YYYY-MM-DD')}`;
      const errorArchiveFolder = `${IMPORT_FOLDER}/archived_process_error/${moment().format('YYYY-MM-DD')}`;

      filenames.forEach(({ filename }) => {
        const from = {
          fileshare,
          folder: IMPORT_FOLDER,
          filename,
        };

        const isProcessError = processErrorFiles.includes(filename);

        const to = {
          fileshare,
          folder: isProcessError ? errorArchiveFolder : archiveFolder,
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
