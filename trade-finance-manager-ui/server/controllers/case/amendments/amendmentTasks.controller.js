const api = require('../../../api');
const { getTask } = require('../../helpers');
const mapAssignToSelectOptions = require('../../../helpers/map-assign-to-select-options');

const getAmendmentTask = async (req, res) => {
  try {
    const { _id: dealId, facilityId, amendmentId, groupId, taskId } = req.params;
    const { user } = req.session;

    let { data: amendment } = await api.getAmendmentsByDealId(dealId);
    [amendment] = amendment.filter((a) => a.amendmentId === amendmentId && a.facilityId === facilityId);
    const task = getTask(Number(groupId), taskId, amendment.tasks);
    if (!task) {
      return res.redirect('/not-found');
    }

    const allTeamMembers = await api.getTeamMembers(task.team.id);

    const assignToSelectOptions = mapAssignToSelectOptions(task.assignedTo.userId, user, allTeamMembers);
    return res.render('case/amendments/amendment-task.njk', {
      user,
      task,
      assignToSelectOptions,
      amendment,
      dealId,
    });
  } catch (error) {
    console.error('Unable to get the amendment request date page', { error });
    return res.redirect('/');
  }
};

const postAmendmentTask = async (req, res) => {
  try {
    const { _id: dealId, facilityId, amendmentId, groupId, taskId } = req.params;

    const { assignedTo: assignedToValue, status } = req.body;

    const update = {
      taskUpdate: {
        id: taskId,
        groupId: Number(groupId),
        status,
        assignedTo: { userId: assignedToValue },
        updatedBy: req.session.user._id,
        urlOrigin: req.headers.origin,
        updateTask: true,
      },
    };

    await api.updateAmendment(facilityId, amendmentId, update);
    return res.redirect(`/case/${dealId}/tasks`);
  } catch (error) {
    return res.redirect('/');
  }
};

module.exports = { getAmendmentTask, postAmendmentTask };
