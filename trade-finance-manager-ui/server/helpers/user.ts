import { TeamId, TfmSessionUser } from '@ukef/dtfs2-common';

export const userFullName = (user: TfmSessionUser) => {
  const { firstName, lastName } = user;
  return `${firstName} ${lastName}`;
};

/**
 * Function to return whether or not a user is in
 * any of the teams provided
 */
export const userIsInTeam = (user: TfmSessionUser, teamIdList: TeamId[]) => user.teams?.some((teamId) => teamIdList.includes(teamId));

/**
 * Function to return whether or not a user is in
 * only the set of teams provided
 */
export const userIsOnlyInTeams = (user: TfmSessionUser, teamIdList: TeamId[]) =>
  user.teams?.length === teamIdList.length && user.teams.every((userTeam) => teamIdList.includes(userTeam));

export const isAssignedToUser = (assignedToUserId: string, userId: string) => assignedToUserId === userId;
