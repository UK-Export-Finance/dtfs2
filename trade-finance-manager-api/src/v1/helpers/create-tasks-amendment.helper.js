const CONSTANTS = require('../../constants');

const NEW_TASK = {
  status: CONSTANTS.TASKS.STATUS.CANNOT_START,
  assignedTo: {
    userId: CONSTANTS.TASKS.UNASSIGNED,
    userFullName: CONSTANTS.TASKS.UNASSIGNED,
  },
  canEdit: false,
};

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
        ...NEW_TASK,
      };

      // only the first task in the first group can be started/edited straight away.
      if (groupId === 1 && taskIdCount === 1) {
        task.canEdit = true;
        task.status = CONSTANTS.TASKS.STATUS.TO_DO;
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

module.exports = {
  NEW_TASK,
  createGroupTasks,
  createTasksAutomaticAmendment,
  createTasksManualAmendment,
  createAmendmentTasks,
};
