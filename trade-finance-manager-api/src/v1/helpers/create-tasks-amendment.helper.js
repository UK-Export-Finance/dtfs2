const CONSTANTS = require('../../constants');

const api = require('../api');
const { getGroupById, getTaskInGroupById, hasAmendmentAdverseHistoryTaskCompleted } = require('./tasks');
const mapTaskObject = require('../tasks/map-task-object');
const { previousTaskIsComplete, taskCanBeEditedWithoutPreviousTaskComplete, handleTaskEditFlagAndStatus } = require('../tasks/tasks-edit-logic');
const sendUpdatedTaskEmail = require('../controllers/task-emails');

/**
 * Create tasks for a single group
 * @param {Array} tasks to add to a group
 * @param {Number} group ID
 * @param {Array} additional/special tasks to add to the group
 * @returns {Array} created tasks
 */
const createGroupTasks = (tasks, groupId) => {
  const mappedTasks = [];
  let taskIdCount = 0;

  tasks.forEach((t) => {
    let task = t;

    /**
     * Only create the task if:
     * - task title is NOT conditional and always applies.
     */
    const shouldCreateTask = !task.isConditional;

    if (shouldCreateTask) {
      // do not rely on index - otherwise if a task is conditional,
      // we can end up with e.g id 1 then skipping to id 3
      taskIdCount += 1;

      task = {
        id: String(taskIdCount),
        groupId,
        ...task,
        status: CONSTANTS.TASKS_AMENDMENT.STATUS.CANNOT_START,
        assignedTo: {
          userId: CONSTANTS.TASKS_AMENDMENT.UNASSIGNED,
          userFullName: CONSTANTS.TASKS_AMENDMENT.UNASSIGNED,
        },
        canEdit: false,
      };

      // only the first task in the first group can be started/edited straight away.
      if (groupId === 1 && taskIdCount === 1) {
        task.canEdit = true;
        task.status = CONSTANTS.TASKS_AMENDMENT.STATUS.TO_DO;
      }

      mappedTasks.push(task);
    }
  });

  return mappedTasks;
};

/**
 * Create AIN tasks/task groups
 * @param {Array} additional/special tasks to add to the group
 * @returns {Array} created task groups
 */
const createTasksAutomaticAmendment = () => [
  {
    groupTitle: CONSTANTS.TASKS_AMENDMENT.AUTOMATIC_AMENDMENT.GROUP_1.GROUP_TITLE,
    id: 1,
    groupTasks: createGroupTasks(CONSTANTS.TASKS_AMENDMENT.AUTOMATIC_AMENDMENT.GROUP_1.TASKS, 1),
  },
];

/**
 * Create MIA tasks/task groups
 * @param {Array} additional/special tasks to add to the group
 * @returns {Array} created task groups
 */
const createTasksManualAmendment = () => [
  {
    groupTitle: CONSTANTS.TASKS_AMENDMENT.MANUAL_AMENDMENT.GROUP_1.GROUP_TITLE,
    id: 1,
    groupTasks: createGroupTasks(CONSTANTS.TASKS_AMENDMENT.MANUAL_AMENDMENT.GROUP_1.TASKS, 1),
  },
  {
    groupTitle: CONSTANTS.TASKS_AMENDMENT.MANUAL_AMENDMENT.GROUP_2.GROUP_TITLE,
    id: 2,
    groupTasks: createGroupTasks(CONSTANTS.TASKS_AMENDMENT.MANUAL_AMENDMENT.GROUP_2.TASKS, 2),
  },
  {
    groupTitle: CONSTANTS.TASKS_AMENDMENT.MANUAL_AMENDMENT.GROUP_3.GROUP_TITLE,
    id: 3,
    groupTasks: createGroupTasks(CONSTANTS.TASKS_AMENDMENT.MANUAL_AMENDMENT.GROUP_3.TASKS, 3),
  },
  {
    groupTitle: CONSTANTS.TASKS_AMENDMENT.MANUAL_AMENDMENT.GROUP_4.GROUP_TITLE,
    id: 4,
    groupTasks: createGroupTasks(CONSTANTS.TASKS_AMENDMENT.MANUAL_AMENDMENT.GROUP_4.TASKS, 4),
  },
];

/**
 * Create tasks/task groups depending on the amendment type (automatic or manual)
 * @param {String} requireUkefApproval - true/false
 * @returns {Array} created task groups
 */
const createAmendmentTasks = (requireUkefApproval) => {
  let tasks = [];
  if (!requireUkefApproval) {
    tasks = createTasksAutomaticAmendment();
  } else if (requireUkefApproval) {
    tasks = createTasksManualAmendment();
  }

  return tasks;
};

/**
 * Update a task in the task's group.
 * */
const updateTask = (allTaskGroups, taskUpdate) =>
  allTaskGroups.map((tGroup) => {
    let group = tGroup;

    group = {
      ...group,
      groupTasks: group.groupTasks.map((t) => {
        let task = t;

        if (task.id === taskUpdate.id && task.groupId === taskUpdate.groupId) {
          task = {
            ...task,
            ...taskUpdate,
          };
        }

        return task;
      }),
    };

    return group;
  });

/**
 * Update all tasks canEdit flag and status
 * Depending on what task has been changed.
 * */
const updateAllTasks = async (allTaskGroups, taskUpdate, urlOrigin, deal) => {
  const taskEmailsToSend = [];

  let taskGroups = allTaskGroups.map((tGroup) => {
    let group = tGroup;

    group = {
      ...group,
      groupTasks: group.groupTasks.map((t) => {
        const task = t;

        const isTaskThatIsBeingUpdated = task.id === taskUpdate.id && task.groupId === taskUpdate.groupId;

        const { updatedTask, sendEmail } = handleTaskEditFlagAndStatus(allTaskGroups, group, task, isTaskThatIsBeingUpdated);

        if (sendEmail) {
          taskEmailsToSend.push(updatedTask);
        }

        return updatedTask;
      }),
    };

    return group;
  });

  /**
   * If 'Complete an adverse history check' task is completed
   * All tasks in the Underwriting Group become unlocked and are able to be started
   * */
  const canUnlockUnderWritingGroupTasks = hasAmendmentAdverseHistoryTaskCompleted(taskGroups);

  if (canUnlockUnderWritingGroupTasks) {
    taskGroups = taskGroups.map((g) => {
      const group = g;

      if (group.groupTitle === CONSTANTS.TASKS_AMENDMENT.GROUP_TITLES.UNDERWRITING) {
        group.groupTasks = group.groupTasks.map((task) => {
          const isTaskThatIsBeingUpdated = task.id === taskUpdate.id && task.groupId === taskUpdate.groupId;

          // add the task to list of emails to be sent
          const shouldSendEmail = !isTaskThatIsBeingUpdated && !task.emailSent;
          if (shouldSendEmail) {
            taskEmailsToSend.push(task);
          }

          // unlock the task
          const shouldUnlock = !isTaskThatIsBeingUpdated && !task.canEdit && task.status === CONSTANTS.TASKS_AMENDMENT.STATUS.CANNOT_START;

          if (shouldUnlock) {
            return {
              ...task,
              canEdit: true,
              status: CONSTANTS.TASKS_AMENDMENT.STATUS.TO_DO,
            };
          }

          return task;
        });
      }

      return group;
    });
  }

  const emailsResponse = await Promise.all(taskEmailsToSend.map((task) => sendUpdatedTaskEmail(task, deal, urlOrigin)));

  /**
   * Add emailSent=true flag to each task that successfully sent an email
   * */
  const tasksToAddEmailSentFlag = [];
  emailsResponse.map((response, index) => {
    if (!response.errors) {
      tasksToAddEmailSentFlag.push(taskEmailsToSend[index]);
    }
    return response;
  });

  taskGroups = taskGroups.map((g) => {
    const group = g;

    const groupHasTaskToUpdate = tasksToAddEmailSentFlag.find((task) => task.groupId === group.id);

    if (groupHasTaskToUpdate) {
      group.groupTasks = group.groupTasks.map((t) => {
        const task = t;

        const taskShouldAddEmailSentFlag = tasksToAddEmailSentFlag.find((taskForEmail) => taskForEmail.id === task.id);

        if (taskShouldAddEmailSentFlag) {
          task.emailSent = true;
        }

        return task;
      });
    }

    return group;
  });

  return taskGroups;
};

/**
 * Function that is first triggered. This:
 * - Gets the amendment and all tasks.
 * - Maps the taskUpdate input into schema format, adding dates.
 * - Finds the group the task belongs to and updates the task in that group.
 * - Checks if the task can be updated.
 * - Maps over all tasks in every group and updates their status/canEdit flag.
 * - If previous task is complete, a sendEmail flag for that task is returned.
 * - If the task is the task that is being updated (by user), task.history is updated.
 * - Sends emails ('task is ready to start') for any tasks that return sendEmail flag.
 * - Adds emailSent flag to any task that successfully sent an email.
 * */
const updateAmendmentTask = async (facilityId, amendmentId, taskUpdate) => {
  const amendment = await api.getAmendmentById(facilityId, amendmentId);
  const { dealSnapshot } = await api.findOneDeal(amendment.dealId);

  const allTasks = amendment.tasks;

  const { id: taskIdToUpdate, groupId, urlOrigin } = taskUpdate;

  const group = getGroupById(allTasks, groupId);
  const originalTask = getTaskInGroupById(group.groupTasks, taskIdToUpdate);
  const statusFrom = originalTask.status;

  const updatedTask = await mapTaskObject(originalTask, taskUpdate, statusFrom);

  const canUpdateTask = previousTaskIsComplete(allTasks, group, updatedTask.id) || taskCanBeEditedWithoutPreviousTaskComplete(group, updatedTask);

  if (canUpdateTask) {
    const modifiedTasks = updateTask(allTasks, updatedTask);
    const modifiedTasksWithEditStatus = await updateAllTasks(modifiedTasks, updatedTask, urlOrigin, dealSnapshot);
    return modifiedTasksWithEditStatus;
  }

  return originalTask;
};

module.exports = {
  createGroupTasks,
  createTasksAutomaticAmendment,
  createTasksManualAmendment,
  createAmendmentTasks,
  updateTask,
  updateAllTasks,
  updateAmendmentTask,
};
