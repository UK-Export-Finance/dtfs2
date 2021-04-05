const userFullName = (user) => {
  const { firstName, lastName } = user;
  return `${firstName} ${lastName}`;
};

const userIsInTeam = (user, teamId) =>
  user.teams.includes(teamId);

const getTask = (taskId, tasks) =>
  tasks.find((t) => t.id === taskId);

const isTaskAssignedToUser = (assignedToUserId, userId) => {
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
  // eslint-disable-next-line no-underscore-dangle
  const taskIsAssignedToUser = isTaskAssignedToUser(taskAssignedTo, currentUser._id);

  const currentUserFullName = userFullName(currentUser);
  const assignToMeCopy = `${currentUserFullName} (Assign to me)`;

  const currentUserId = currentUser._id; // eslint-disable-line no-underscore-dangle

  const mappedTeamMembersSelectOptions = mapTeamMembersSelectOptions(
    allTeamMembers,
    taskAssignedTo,
    currentUserId,
  );

  const taskIsUnassigned = task.assignedTo.userId === 'Unassigned';

  // 3 possible states:
  // task is assigned to someone that is not the current logged in user.
  // task is unassigned
  // task is assigned ot me

  // default mapping is that task is assigned to someone that is not the current logged in user.
  let mapped = [
    {
      value: currentUserId,
      text: assignToMeCopy,
      selected: false,
    },
    {
      value: 'Unassigned',
      text: 'Unassigned',
      selected: false,
    },
    ...mappedTeamMembersSelectOptions,
  ];

  if (taskIsUnassigned) {
    mapped = [
      {
        value: 'Unassigned',
        text: 'Unassigned',
        selected: true,
      },
      {
        value: currentUserId,
        text: assignToMeCopy,
        selected: false,
      },
      ...mappedTeamMembersSelectOptions,
    ];
  }

  if (taskIsAssignedToUser) {
    mapped = [
      {
        value: 'Unassigned',
        text: 'Unassigned',
        selected: false,
      },
      {
        value: currentUserId,
        text: currentUserFullName,
        selected: true,
      },
      ...mappedTeamMembersSelectOptions,
    ];
  }

  return mapped;
};

const groupTaskInProgress = (groupTasks) =>
  groupTasks.find((task) =>
    (task.status === 'In progress'));

const mapTasks = (tasks) => {
  // only 1 task can be in progress.
  // all other tasks cannot be accessed in the UI.

  const allTaskGroups = tasks.map((g) => {
    const group = {
      ...g,
      taskIdInProgress: groupTaskInProgress(g.groupTasks).id,
    };

    return group;
  });

  const mappedTasks = allTaskGroups.map((g) => {
    const group = g;

    if (group.taskIdInProgress) {
      return {
        ...group,
        groupTasks: group.groupTasks.map((task) => {
          if (task.id === group.taskIdInProgress) {
            return {
              ...task,
              canEdit: true,
            };
          }

          return task;
        }),
      };
    }

    return group;
  });

  return mappedTasks;
};

export default {
  userFullName,
  userIsInTeam,
  getTask,
  isTaskAssignedToUser,
  getTeamMembersWithoutCurrentUser,
  mapTeamMembersSelectOptions,
  mapAssignToSelectOptions,
  mapTasks,
};
