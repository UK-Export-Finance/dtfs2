const $ = require('mongo-dot-notation');
const api = require('../api');
const db = require('../../drivers/db-client');
const CONSTANTS = require('../../constants');
const dealSubmitController = require('./deal.submit.controller');
const gefController = require('./gef.controller');

const otherDealTasksStillRunning = (task, taskList) => taskList.some((t) => t.dealId === task.dealId && ['Pending', 'Running'].includes(t.runtimeStatus));

const updatePortalDeal = (input, { ukefId }) => {
  if (input.entityType === 'deal') {
    return api.updatePortalDeal(input.entityId, {
      details: {
        ukefDealId: ukefId,
      },
    });
  }

  if (input.entityType === 'facility') {
    return api.updatePortalFacility(input.entityId, {
      ukefFacilityId: ukefId,
    });
  }

  return Promise.reject();
};

const updateGefApplication = (input, { ukefId }) => {
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

  const collection = await db.getCollection('durable-functions-log');
  const runningTasks = await collection
    .find({
      status: { $eq: 'Running' },
      type: { $eq: CONSTANTS.DURABLE_FUNCTIONS.TYPE.NUMBER_GENERATOR },
    })
    .toArray();

  const taskResults = runningTasks.map(({ numberGeneratorFunctionUrls = {} }) =>
    api.getFunctionsAPI(CONSTANTS.DURABLE_FUNCTIONS.TYPE.NUMBER_GENERATOR, numberGeneratorFunctionUrls.statusQueryGetUri),
  );

  const taskResultsList = await Promise.all(taskResults);

  taskResultsList.forEach(async (task) => {
    if (task?.runtimeStatus === 'Completed' && !task?.output?.ukefId?.error) {
      // Only process if all tasks for that deals have finished
      if (otherDealTasksStillRunning(task, taskResultsList)) {
        return;
      }

      const { input, output, instanceId, runtimeStatus } = task;

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

      // Submit to TFM.
      // Only trigger this update if the Azure function task's ID, is the same as the deal ID.
      // Without this conditional, every task (i.e multiple facilities) will trigger multiple deal submissions.
      if (input.entityId === input.dealId) {
        await dealSubmitController.submitDealAfterUkefIds(input.entityId, input.dealType, input.user);
      }

      // Update functionLog
      // Keep any with errors for reference but remove successful ones
      if (output && output.error) {
        await collection.findOneAndUpdate(
          { instanceId: { $eq: instanceId } },
          $.flatten({
            status: runtimeStatus,
            taskResult: task,
          }),
        );
      } else if (typeof instanceId === 'string') {
        await collection.deleteOne({ instanceId: { $eq: instanceId } });
      }
    }
  });
};

module.exports = {
  checkAzureNumberGeneratorFunction,
  updatePortalDeal,
};
