const { userFullName } = require('./user');

const getTeamMembersWithoutCurrentUser = (teamMembers, currentUserId) =>
  teamMembers.filter((teamMember) =>
    teamMember._id !== currentUserId);

const mapTeamMembersSelectOptions = (members, assignedToUserId, currentUserId) => {
  const membersWithoutCurrentUser = getTeamMembersWithoutCurrentUser(members, currentUserId);

  return membersWithoutCurrentUser.map((member) => {
    const { _id: memberId } = member;

    return {
      value: memberId,
      text: userFullName(member),
      selected: assignedToUserId === memberId,
    };
  });
};

module.exports = {
  getTeamMembersWithoutCurrentUser,
  mapTeamMembersSelectOptions,
};
