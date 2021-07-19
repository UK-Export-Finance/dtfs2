const { lowercaseFirstLetter } = require('../../utils/string');

const generateTaskUrl = (urlOrigin, dealId, task) => {
  const {
    id: taskId,
    groupId,
  } = task;

  return `${urlOrigin}/case/${dealId}/tasks/${groupId}/${taskId}`;
};

const generateTaskEmailVariables = (urlOrigin, task, dealId, exporterName, ukefDealId) => ({
  taskTitle: lowercaseFirstLetter(task.title),
  taskUrl: generateTaskUrl(urlOrigin, dealId, task),
  exporterName,
  ukefDealId,
});


module.exports = {
  generateTaskUrl,
  generateTaskEmailVariables,
};
