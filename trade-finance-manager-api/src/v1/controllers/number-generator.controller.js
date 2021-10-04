const $ = require('mongo-dot-notation');
const api = require('../api');
const db = require('../../drivers/db-client');
const CONSTANTS = require('../../constants');
const dealSubmitController = require('./deal.submit.controller');
const gefController = require('./gef.controller');

const otherDealTasksStillRunning = (task, taskList) => taskList.some((t) => t.dealId === task.dealId && ['Pending', 'Running'].includes(t.runtimeStatus));

const updatePortalDeal = async (input, { ukefId }) => {
  if (input.entityType === 'deal') {
    return api.updatePortalDeal(input.entityId, {
      details: {
        ukefDealId: ukefId,
      },
    });
  }

  if (input.entityType === 'facility') {
    return api.updatePortalFacility(input.entityId, {
      ukefFacilityID: ukefId,
    });
  }

  return Promise.reject();
};

const updateGefApplication = async (input, { ukefId }) => {
  if (input.entityType === 'deal') {
    return gefController.updateGefApplication(input.entityId, {
      ukefDealId: ukefId,
    });
  }

  if (input.entityType === 'facility') {
    return gefController.updateGefFacility(input.entityId, {
      ukefFacilityId: ukefId,
    });
  }

  return Promise.reject();
};

const checkAzureNumberGeneratorFunction = async () => {
  // Fetch outstanding functions
  console.log('TFM API checkAzureNumberGeneratorFunction called');

  const collection = await db.getCollection('durable-functions-log');
  const runningTasks = await collection.find({
    status: 'Running',
    type: CONSTANTS.DURABLE_FUNCTIONS.TYPE.NUMBER_GENERATOR,
  }).toArray();

  console.log('TFM API checkAzureNumberGeneratorFunction runningTasks ', runningTasks);

  const taskResults = runningTasks.map(
    ({ numberGeneratorFunctionUrls = {} }) => api.getFunctionsAPI(
      CONSTANTS.DURABLE_FUNCTIONS.TYPE.NUMBER_GENERATOR, numberGeneratorFunctionUrls.statusQueryGetUri,
    ),
  );

  const taskResultsList = await Promise.all(taskResults);

  console.log('TFM API checkAzureNumberGeneratorFunction taskResultsList ', taskResultsList);

  taskResultsList.forEach(async (task) => {
    if (task.runtimeStatus === 'Completed') {
      // Only process if all tasks for that deals have finished
      if (otherDealTasksStillRunning(task, taskResultsList)) {
        return;
      }

      const { input, output } = task;

      // Update portalDeal
      switch (input.dealType) {
        case CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS:
          await updatePortalDeal(input, output);
          break;

        case CONSTANTS.DEALS.DEAL_TYPE.GEF:
          await updateGefApplication(input, output);
          break;

        default:
          return;
      }

      console.log('TFM API checkAzureNumberGeneratorFunction calling submitDealAfterUkefIds');

      // Update TFM
      await dealSubmitController.submitDealAfterUkefIds(input.entityId, input.dealType, input.user);

      // Update functionLog
      // Keep any with errors for reference but remove successful ones
      if (task.output && task.output.error) {
        await collection.findOneAndUpdate(
          { instanceId: task.instanceId },
          $.flatten({
            status: task.runtimeStatus,
            taskResult: task,
          }),
        );
      } else {
        await collection.deleteOne({
          instanceId: task.instanceId,
        });
      }
    }
  });
};


module.exports = {
  checkAzureNumberGeneratorFunction,
  updatePortalDeal,
};
