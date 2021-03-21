const getTask = (taskId, tasks) =>
  tasks.find((t) => t.id === taskId);

// TODO simplify this condition when we have default assignedTo
const isTaskIsAssignedToUser = (taskAssignedTo, userId) => {
  if ((taskAssignedTo && taskAssignedTo.userId) && taskAssignedTo.userId === userId) {
    return true;
  }

  return false;
};

const userFullName = (user) => {
  const { firstName, lastName } = user;
  return `${firstName} ${lastName}`;
};

export default {
  getTask,
  isTaskIsAssignedToUser,
  userFullName,
};
