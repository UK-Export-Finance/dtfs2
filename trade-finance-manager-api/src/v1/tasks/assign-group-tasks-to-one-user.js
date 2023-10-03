const api = require('../api');
const getAssigneeFullName = require('../helpers/get-assignee-full-name');

/**
 * Assign multiple group tasks to a user
 * @param {String} deal ID
 * @param {Array} array of group titles that the should be assigned to the user
 * @param {String} user ID
 * @returns {Array} Updated tasks
 */
const assignGroupTasksToOneUser = async (dealId, groupTitlesToAssign, userId) => {
  const deal = await api.findOneDeal(dealId);
  const allTaskGroups = deal.tfm.tasks;

  const newAssigneeFullName = await getAssigneeFullName(userId);

  let modifiedTasks = allTaskGroups;

  modifiedTasks = modifiedTasks.map((tGroup) => {
    let group = tGroup;

    group = {
      ...group,
      groupTasks: group.groupTasks.map((t) => {
        let task = t;

        /**
         * Use group title instead of id.
         * This ensures that the functionality will still work
         * if the ordering is changed.
         * */
        if (groupTitlesToAssign.includes(group.groupTitle)) {
          task = {
            ...task,
            assignedTo: {
              userFullName: newAssigneeFullName,
              userId,
            },
          };
        }

        return task;
      }),
    };

    return group;
  });

  const tfmDealUpdate = {
    tfm: {
      tasks: modifiedTasks,
    },
  };

  await api.updateDeal(dealId, tfmDealUpdate);

  return modifiedTasks;
};

module.exports = assignGroupTasksToOneUser;
