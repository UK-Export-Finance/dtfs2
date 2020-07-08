jest.unmock('@azure/storage-file-share');
// jest.mock('../../../src/v1/controllers/integration/type-b.controller');
const typeBController = require('../../../src/v1/controllers/integration/type-b.controller');

typeBController.processTypeB = jest.fn();

const fetchWorkflowTypeB = require('../../../src/scheduler/jobs/fetch-workflow-type-b');
const fileshare = require('../../../src/drivers/fileshare');

describe('schedule fetching of type b', () => {
  const originalWarn = console.warn;
  const originalLog = console.log;

  const mockedWarn = jest.fn();
  const mockedLog = jest.fn();

  const { schedule, message, task } = fetchWorkflowTypeB.init();
  const fileshareName = 'portal';
  const folder = 'api_tests/fetch-workflow-type-b';
  const filename = 'type-b-test.xml';
  const someXML = '<?xml version="1.0" encoding="UTF-8"?><Deal/>';

  beforeEach(async () => {
    console.warn = mockedWarn;
    console.log = mockedLog;

    await fileshare.getDirectory({
      fileshare: fileshareName,
      folder,
    }).catch((err) => {
      console.log(err);
    });
  });

  afterEach(() => {
    console.warn = originalWarn;
    console.log = originalLog;
  });

  it('should return a schedule & task on initialisation', () => {
    expect(schedule).toEqual('* * * * *');
    expect(message).toEqual('Fetch workflow type B every 1 min');
    expect(typeof task).toEqual('function');
  });

  it('should do nothing if no files found', async () => {
    const taskResult = await task(fileshareName, folder);
    expect(taskResult).toEqual(false);
  });

  describe('found xml files', () => {
    beforeEach(async () => {
      await fileshare.uploadFile({
        fileshare: fileshareName,
        folder,
        filename,
        buffer: Buffer.from(someXML, 'utf-8'),
      }).catch((err) => {
        console.log(err);
      });
    });

    afterEach(async () => {
      await fileshare.deleteFile(fileshareName, `${folder}/${filename}`);
    });

    it('should process and archive found files', async () => {
      const taskResult = await task(fileshareName, folder);
      expect(taskResult.length).toEqual(1);
      expect(typeBController.processTypeB).toHaveBeenCalled();
    });
  });
});
