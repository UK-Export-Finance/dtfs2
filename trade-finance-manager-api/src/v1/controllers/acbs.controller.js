const moment = require('moment');
const $ = require('mongo-dot-notation');
const api = require('../api');
const db = require('../../drivers/db-client');
const { findOneBank } = require('./banks.controller');

const addToACBSLog = async ({ deal, bank, acbsTaskLinks }) => {
  const collection = await db.getCollection('acbs-log');

  const acbsLog = await collection.insertOne({
    // eslint-disable-next-line no-underscore-dangle
    dealId: deal._id,
    deal,
    bank,
    status: 'Running',
    instanceId: acbsTaskLinks.id,
    acbsTaskLinks,
    submittedDate: moment().format(),
  });

  return acbsLog;
};

const createACBS = async (deal) => {
  // Add bank's full details so we can reference partyUrn in function
  const bankId = deal.dealSnapshot.details.owningBank.id;
  const { id, name, partyUrn } = await findOneBank(bankId);
  const bank = { id, name, partyUrn };

  const acbsTaskLinks = await api.createACBS(deal, bank);
  await addToACBSLog({ deal, bank, acbsTaskLinks });
  return acbsTaskLinks;
};


const checkAzureAcbsFunction = async () => {
  // Fetch outstanding functions
  const collection = await db.getCollection('acbs-log');
  const runningTasks = await collection.find({ status: 'Running' }).toArray();

  const tasks = runningTasks.map(({ acbsTaskLinks = {} }) => api.getFunctionsAPI(acbsTaskLinks.statusQueryGetUri));

  const taskList = await Promise.all(tasks);

  taskList.forEach(async (task) => {
    // eslint-disable-next-line no-underscore-dangle
    // Update
    if (task.runtimeStatus !== 'Running') {
      await collection.findOneAndUpdate(
        { instanceId: task.instanceId },
        $.flatten({
          status: task.runtimeStatus,
          acbsTaskResult: task,
        }),
      );
    }
  });
};


module.exports = {
  createACBS,
  checkAzureAcbsFunction,
};
