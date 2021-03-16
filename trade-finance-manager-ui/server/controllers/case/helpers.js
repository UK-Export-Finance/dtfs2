const getTask = (taskId, tasks) =>
  tasks.find((t) => t.id === taskId);

const isTaskIsAssignedToUser = (taskAssignedTo, userId) =>
  taskAssignedTo === userId;

const userFullName = (user) => {
  const { firstName, lastName } = user;
  return `${firstName} ${lastName}`;
};

export default {
  getTask,
  isTaskIsAssignedToUser,
  userFullName,
};
