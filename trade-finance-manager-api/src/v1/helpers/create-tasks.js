const CONSTANTS = require('../../constants');

const NEW_TASK = ({
  status: CONSTANTS.TASKS.STATUS.CANNOT_START,
  assignedTo: {
    userId: CONSTANTS.TASKS.UNASSIGNED,
    userFullName: CONSTANTS.TASKS.UNASSIGNED,
  },
  canEdit: false,
});

const createGroupTasks = (tasks, groupId, excludedTasks = []) => {
  const mappedTasks = [];
  let taskIdCount = 0;

  tasks.forEach((t) => {
    let task = t;

    // only add the task if the title is in excludedTasks array
    if (!excludedTasks.includes(task.title)) {
      // do not rely on index - otherwise if a task is excluded,
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

const createTasksAIN = (excludedTasks) => [
  {
    groupTitle: CONSTANTS.TASKS.AIN.GROUP_1.GROUP_TITLE,
    id: 1,
    groupTasks: createGroupTasks(
      CONSTANTS.TASKS.AIN.GROUP_1.TASKS,
      1,
      excludedTasks,
    ),
  },
];

const createTasksMIA = (excludedTasks) => [
  {
    groupTitle: CONSTANTS.TASKS.MIA.GROUP_1.GROUP_TITLE,
    id: 1,
    groupTasks: createGroupTasks(
      CONSTANTS.TASKS.MIA.GROUP_1.TASKS,
      1,
      excludedTasks,
    ),
  },
  {
    groupTitle: CONSTANTS.TASKS.MIA.GROUP_2.GROUP_TITLE,
    id: 2,
    groupTasks: createGroupTasks(
      CONSTANTS.TASKS.MIA.GROUP_2.TASKS,
      2,
      excludedTasks,
    ),
  },
  {
    groupTitle: CONSTANTS.TASKS.MIA.GROUP_3.GROUP_TITLE,
    id: 3,
    groupTasks: createGroupTasks(
      CONSTANTS.TASKS.MIA.GROUP_3.TASKS,
      3,
      excludedTasks,
    ),
  },
  {
    groupTitle: CONSTANTS.TASKS.MIA.GROUP_4.GROUP_TITLE,
    id: 4,
    groupTasks: createGroupTasks(
      CONSTANTS.TASKS.MIA.GROUP_4.TASKS,
      4,
      excludedTasks,
    ),
  },
];

const createTasks = (
  submissionType,
  excludedTasks,
) => {
  let tasks = [];

  if (submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN) {
    tasks = createTasksAIN(excludedTasks);
  }

  if (submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA) {
    tasks = createTasksMIA(excludedTasks);
  }

  return tasks;
};

module.exports = {
  NEW_TASK,
  createGroupTasks,
  createTasksAIN,
  createTasksMIA,
  createTasks,
};
