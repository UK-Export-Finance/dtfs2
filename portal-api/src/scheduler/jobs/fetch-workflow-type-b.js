const moment = require('moment');

const defaultSchedule = '*/1 * * * * *';
const schedule = process.env.FETCH_WORKFLOW_TYPE_B_SCHEDULE || defaultSchedule;
const {
  listDirectoryFiles, readFile, moveFile, getConfig, uploadFile, deleteFile,
} = require('../../drivers/fileshare');
const { processTypeB } = require('../../v1/controllers/integration/type-b.controller');

const task = async (overwriteFolder, fileshare = 'workflow') => {
  const { IMPORT_FOLDER } = getConfig(fileshare);

  const lockFile = {
    fileshare: 'workflow',
    folder: IMPORT_FOLDER,
    filename: 'portal.lock',
    buffer: Buffer.from('', 'utf-8'),
  };

  const workflowImportFolder = {
    fileshare,
    folder: overwriteFolder || IMPORT_FOLDER,
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

  for (let i = 0; i < fileContents.length; i += 1) {
    /*
      Need to loop through asyncronously as need to wait for 1st update
      to be completed before updating next as it could refer to same deal
    */
    // eslint-disable-next-line no-await-in-loop
    await processTypeB(fileContents[i]).catch(() => ({
      filename: fileContents[[i]].filename,
      success: false,
    })).then((processedTypeB) => {
      processList.push(processedTypeB);
    });
  }

  const processErrorFiles = processList.filter((pl) => !pl.success).map(({ filename }) => filename);

  const moveFilePromises = [];

  const archiveFolder = `${IMPORT_FOLDER}/archived/${moment().format('YYYY-MM-DD')}`;
  const errorArchiveFolder = `${IMPORT_FOLDER}/archived/process_error/${moment().format('YYYY-MM-DD-HH-mm-ss')}`;
  const errorFilesystemFolder = `${IMPORT_FOLDER}/archived/filesystem_error/${moment().format('YYYY-MM-DD-HH-mm-ss')}`;

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
    errorFiles.forEach(async ({ reason }) => {
      const from = {
        fileshare,
        folder: IMPORT_FOLDER,
        filename: reason.message,
      };

      const to = {
        fileshare,
        folder: errorFilesystemFolder,
        filename: reason.message,
      };

      await moveFile({ to, from }).catch(() => {});
    });
  }

  return files;
};

const fetchWorkflowTypeB = {
  init: () => ({
    schedule,
    message: 'Fetch workflow type B as configured by FETCH_WORKFLOW_TYPE_B_SCHEDULE',
    task: async (overwriteFolder, fileshare = 'workflow') => {
      const { IMPORT_FOLDER } = getConfig(fileshare);

      const lockFile = {
        fileshare: 'workflow',
        folder: IMPORT_FOLDER,
        filename: 'portal.lock',
        buffer: Buffer.from('', 'utf-8'),
      };

      try {
        return await task(fileshare, overwriteFolder);
      } catch (err) {
        return deleteFile('workflow', `${lockFile.folder}/${lockFile.filename}`);
      }
    },
  }),
};

module.exports = fetchWorkflowTypeB;
