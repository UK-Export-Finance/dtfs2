import { userFullName } from './user';

export const getTeamMembersWithoutCurrentUser = (teamMembers, currentUserId) =>
  teamMembers.filter((teamMember) =>
    teamMember._id !== currentUserId); // eslint-disable-line no-underscore-dangle

export const mapTeamMembersSelectOptions = (members, assignedToUserId, currentUserId) => {
  const membersWithoutCurrentUser = getTeamMembersWithoutCurrentUser(members, currentUserId);

  return membersWithoutCurrentUser.map((member) => {
    // eslint-disable-next-line no-underscore-dangle
    const { _id: memberId } = member;

    return {
      value: memberId,
      text: userFullName(member),
      selected: assignedToUserId === memberId,
    };
  });
};
