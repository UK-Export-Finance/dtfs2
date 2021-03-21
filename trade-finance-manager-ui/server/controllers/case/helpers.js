const userFullName = (user) => {
  const { firstName, lastName } = user;
  return `${firstName} ${lastName}`;
};

const getTask = (taskId, tasks) =>
  tasks.find((t) => t.id === taskId);

// TODO simplify this condition when we have default assignedTo
const isTaskIsAssignedToUser = (assignedToUserId, userId) => {
  if (assignedToUserId === userId) {
    return true;
  }

  return false;
};

const getTeamMembersWithoutCurrentUser = (teamMembers, currentUserId) =>
  teamMembers.filter((teamMember) =>
    teamMember._id !== currentUserId); // eslint-disable-line no-underscore-dangle


const mapTeamMembersSelectOptions = (members, taskAssignedTo, currentUserId) => {
  const membersWithoutCurrentUser = getTeamMembersWithoutCurrentUser(members, currentUserId);

  return membersWithoutCurrentUser.map((member) => {
    // eslint-disable-next-line no-underscore-dangle
    const { _id: memberId } = member;

    return {
      value: memberId,
      text: userFullName(member),
      selected: taskAssignedTo === memberId,
    };
  });
};

const mapAssignToSelectOptions = (task, currentUser, allTeamMembers) => {
  const taskAssignedTo = task.assignedTo.userId;
  const taskIsAssignedToUser = isTaskIsAssignedToUser(taskAssignedTo, currentUser);

  const assignToMeCopy = `${userFullName(currentUser)} (Assign to me)`;

  const currentUserId = currentUser._id; // eslint-disable-line no-underscore-dangle

  const mappedTeamMembersSelectOptions = mapTeamMembersSelectOptions(
    allTeamMembers,
    taskAssignedTo,
    currentUserId,
  );

  return [
    {
      value: 'Unassigned',
      text: 'Unassigned',
      selected: task.assignedTo.userId === 'Unassigned',
    },
    {
      value: currentUserId,
      text: assignToMeCopy,
      selected: taskIsAssignedToUser,
    },
    ...mappedTeamMembersSelectOptions,
  ];
};


export default {
  userFullName,
  getTask,
  isTaskIsAssignedToUser,
  getTeamMembersWithoutCurrentUser,
  mapTeamMembersSelectOptions,
  mapAssignToSelectOptions,
};
