const getGroup = (groupId, allTasks) => allTasks.find((group) => group.id === groupId);

const getTask = (groupId, taskId, tasks) => {
  const group = getGroup(groupId, tasks);

  if (group) {
    const task = group.groupTasks.find((t) => t.id === taskId);

    if (!task) {
      return null;
    }

    return task;
  }

  return null;
};

const FILTER_TYPE = {
  ALL: 'all',
  TEAM: 'team',
  USER: 'user',
};

const mapAndFilter = (tasks, argsFunc, FILTER_VALUE) => {
  const filteredTasks = [];

  tasks.map((group) => {
    const { groupTasks } = group;

    let filteredGroup = {
      ...group,
      groupTasks: [],
    };

    groupTasks.map((task) => {
      filteredGroup = argsFunc(task, filteredGroup, FILTER_VALUE);

      return task;
    });

    if (filteredGroup.groupTasks.length > 0) {
      filteredTasks.push(filteredGroup);
      return filteredGroup;
    }

    return {};
  });

  return filteredTasks;
};

const filterTeamTasksInGroup = (task, group, FILTER_VALUE) => {
  const filteredGroup = group;
  const { team } = task;

  if (team.id === FILTER_VALUE) {
    filteredGroup.groupTasks.push(task);
    return filteredGroup;
  }

  return group;
};

const filterTeamTasks = (tasks, FILTER_TEAM_ID) => mapAndFilter(tasks, filterTeamTasksInGroup, FILTER_TEAM_ID);

const filterUserTasksInGroup = (task, group, FILTER_VALUE) => {
  const filteredGroup = group;
  const { assignedTo } = task;

  if (assignedTo.userId === FILTER_VALUE) {
    filteredGroup.groupTasks.push(task);
    return filteredGroup;
  }

  return group;
};

const filterUserTasks = (tasks, FILTER_USER_ID) => mapAndFilter(tasks, filterUserTasksInGroup, FILTER_USER_ID);

const filterTasks = (tasks, filtersObj) => {
  if (!filtersObj || !filtersObj.filterType || filtersObj.filterType === FILTER_TYPE.ALL) {
    return tasks;
  }

  const { filterType } = filtersObj;

  if (filterType === FILTER_TYPE.TEAM) {
    const { teamId } = filtersObj;
    return filterTeamTasks(tasks, teamId);
  }

  if (filterType === FILTER_TYPE.USER) {
    const { userId } = filtersObj;
    return filterUserTasks(tasks, userId);
  }

  return tasks;
};

module.exports = {
  mapAndFilter,
  filterTeamTasksInGroup,
  filterTeamTasks,
  filterUserTasksInGroup,
  filterUserTasks,
  filterTasks,
  getGroup,
  getTask,
};
