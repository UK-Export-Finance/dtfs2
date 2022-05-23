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

module.exports = { getGroup, getTask };
