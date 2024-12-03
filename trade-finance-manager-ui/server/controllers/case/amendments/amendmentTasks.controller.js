const api = require('../../../api');
const { getTask } = require('../../helpers');
const mapAssignToSelectOptions = require('../../../helpers/map-assign-to-select-options');

const getAmendmentTask = async (req, res) => {
  try {
    const { _id: dealId, facilityId, amendmentId, groupId, taskId } = req.params;
    const { user, userToken } = req.session;

    let { data: amendment } = await api.getAmendmentsByDealId(dealId, userToken);
    [amendment] = amendment.filter((a) => a.amendmentId === amendmentId && a.facilityId === facilityId);
    const task = getTask(Number(groupId), taskId, amendment.tasks);
    if (!task) {
      return res.redirect('/not-found');
    }

    const allTeamMembers = await api.getTeamMembers(task.team.id, userToken);

    const assignToSelectOptions = mapAssignToSelectOptions(task.assignedTo.userId, user, allTeamMembers);
    return res.render('case/amendments/amendment-task.njk', {
      user,
      task,
      assignToSelectOptions,
      amendment,
      dealId,
    });
  } catch (error) {
    console.error('Unable to get the amendment request date page %o', error);
    return res.redirect('_partials/problem-with-service.njk');
  }
};

/**
 * Handles the posting of an amendment task.
 *
 * This function extracts necessary parameters from the request object, validates them,
 * constructs an update object, and calls the API to update the amendment task.
 * If successful, it redirects to the tasks page of the deal. If an error occurs,
 * it logs the error and redirects to an error page.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The parameters from the request URL.
 * @param {string} req.params._id - The deal ID.
 * @param {string} req.params.facilityId - The facility ID.
 * @param {string} req.params.amendmentId - The amendment ID.
 * @param {string} req.params.groupId - The group ID.
 * @param {string} req.params.taskId - The task ID.
 * @param {Object} req.session - The session object.
 * @param {Object} req.session.user - The user object from the session.
 * @param {string} req.session.userToken - The user token from the session.
 * @param {Object} req.headers - The headers from the request.
 * @param {string} req.headers.origin - The origin URL from the headers.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.assignedTo - The user ID to whom the task is assigned.
 * @param {string} req.body.status - The status of the task.
 * @param {Object} res - The response object.
 *
 * @returns {Promise<void>} - A promise that resolves when the task is complete.
 */
const postAmendmentTask = async (req, res) => {
  try {
    const { _id: dealId, facilityId, amendmentId, groupId, taskId } = req.params;
    const { user, userToken } = req.session;
    const { origin: urlOrigin } = req.headers;
    const { assignedTo: userId, status } = req.body;

    if (!dealId || !facilityId || !amendmentId || !groupId || !taskId) {
      throw new Error('Invalid mandatory parameter');
    }

    const update = {
      taskUpdate: {
        id: taskId,
        groupId: Number(groupId),
        status,
        assignedTo: { userId },
        updatedBy: user._id,
        urlOrigin,
        updateTask: true,
      },
    };

    await api.updateAmendment(facilityId, amendmentId, update, userToken);
    return res.redirect(`/case/${dealId}/tasks`);
  } catch (error) {
    console.error('Unable to update amendment task %s for group %s %o', req.params.taskId, req.params.groupId, error);
    return res.redirect('_partials/problem-with-service.njk');
  }
};

module.exports = { getAmendmentTask, postAmendmentTask };
