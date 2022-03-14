const {
  isAssignedToUser,
  userFullName,
} = require('./user');
const { mapTeamMembersSelectOptions } = require('./team');

const mapAssignToSelectOptions = (assignedToUserId, currentUser, allTeamMembers) => {
  const isCurrentlyAssignedToUser = isAssignedToUser(assignedToUserId, currentUser._id);

  const currentUserFullName = userFullName(currentUser);
  const assignToMeCopy = `${currentUserFullName} (Assign to me)`;

  const currentUserId = currentUser._id;

  const mappedTeamMembersSelectOptions = mapTeamMembersSelectOptions(
    allTeamMembers,
    assignedToUserId,
    currentUserId,
  );

  const isUnassigned = assignedToUserId === 'Unassigned';

  // 3 possible states:
  // is assigned to someone that is not the currently logged in user.
  // is unassigned
  // is assigned to me/currently logged in user.

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

  if (isUnassigned) {
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

  if (isCurrentlyAssignedToUser) {
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

module.exports = mapAssignToSelectOptions;
