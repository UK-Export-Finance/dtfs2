import api from '../../../../api';
import CONSTANTS from '../../../../constants';
import mapAssignToSelectOptions from '../../../../helpers/map-assign-to-select-options';

// export const mapAssignToSelectOptions = (assignedToUserId = '', currentUser, allTeamMembers) => {
//   // eslint-disable-next-line no-underscore-dangle
//   const isCurrentlyAssignedToUser = isAssignedToUser(assignedToUserId, currentUser._id);

//   const currentUserFullName = userFullName(currentUser);
//   const assignToMeCopy = `${currentUserFullName} (Assign to me)`;

//   const currentUserId = currentUser._id; // eslint-disable-line no-underscore-dangle

//   const mappedTeamMembersSelectOptions = mapTeamMembersSelectOptions(
//     allTeamMembers,
//     assignedToUserId,
//     currentUserId,
//   );

//   const isUnassigned = assignedToUserId === 'Unassigned';

//   // 3 possible states:
//   // is assigned to someone that is not the currently logged in user.
//   // is unassigned
//   // is assigned to me/currently logged in user.

//   let mapped = [
//     {
//       value: currentUserId,
//       text: assignToMeCopy,
//       selected: false,
//     },
//     {
//       value: 'Unassigned',
//       text: 'Unassigned',
//       selected: false,
//     },
//     ...mappedTeamMembersSelectOptions,
//   ];

//   if (isUnassigned) {
//     mapped = [
//       {
//         value: 'Unassigned',
//         text: 'Unassigned',
//         selected: true,
//       },
//       {
//         value: currentUserId,
//         text: assignToMeCopy,
//         selected: false,
//       },
//       ...mappedTeamMembersSelectOptions,
//     ];
//   }

//   if (isCurrentlyAssignedToUser) {
//     mapped = [
//       {
//         value: 'Unassigned',
//         text: 'Unassigned',
//         selected: false,
//       },
//       {
//         value: currentUserId,
//         text: currentUserFullName,
//         selected: true,
//       },
//       ...mappedTeamMembersSelectOptions,
//     ];
//   }

//   return mapped;
// };


const getLeadUnderwriter = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  const { user } = req.session;

  const allTeamMembers = await api.getTeamMembers(CONSTANTS.TEAMS.UNDERWRITERS);
  console.log('*** allTeamMembers \n', allTeamMembers);

  return res.render('case/underwriting/lead-underwriter/lead-underwriter.njk', {
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'underwriting',
    activeSideNavigation: 'lead underwriter',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
    user,
    assignToSelectOptions: mapAssignToSelectOptions('', user, allTeamMembers),
  });
};


export default {
  getLeadUnderwriter,
};
