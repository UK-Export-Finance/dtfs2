
const { listDirectoryFiles, readFile } = require('../../drivers/fileshare');
const { processTypeB } = require('../../v1/controllers/integration/type-b.controller');

const fetchWorkflowTypeB = {
  init: () => ({
    schedule: '* * * * *',
    message: 'Fetch workflow type B every 15 mins',
    task: async () => {
      const fileshare = 'workflow';
      const folder = 'type-b';

      const workflowImportFolder = {
        fileshare,
        folder,
      };

      const files = await listDirectoryFiles(workflowImportFolder);

      const filePromises = [];
      const filenames = [];

      files.filter((f) => f.kind === 'file').forEach((file) => {
        const documentLocation = {
          fileshare,
          folder,
          filename: file.name,
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

      console.log('running a task every minute x');
    },
  }),
};

module.exports = fetchWorkflowTypeB;
