const { getUnixTime } = require('date-fns');
const { updateDeal } = require('./update-deal');
const { PORTAL_ACTIVITY_LABEL, PORTAL_ACTIVITY_TYPE } = require('../../../../constants');

/**
 * Add a "deal cancelled" activity to a GEF deal.
 * @param {string | ObjectId} addGefDealCancelledActivity.dealId - the dealId
 * @param {import('@ukef/dtfs2-common').Activity[]} addGefDealCancelledActivity.portalActivities - previous/existing deal activities
 * @param {import('@ukef/dtfs2-common').ActivityAuthor} addGefDealCancelledActivity.author - the activity's author
 * @param {import('@ukef/dtfs2-common').AuditDetails} addGefDealCancelledActivity.auditDetails - the users audit details
 * @returns {Promise<('@ukef/dtfs2-common').Deal>}
 */
exports.addGefDealCancelledActivity = async ({ dealId, portalActivities, author, auditDetails }) => {
  try {
    const newActivity = {
      type: PORTAL_ACTIVITY_TYPE.DEAL_CANCELLED,
      timestamp: getUnixTime(new Date()),
      author: {
        _id: author._id,
        firstName: 'UKEF',
      },
      label: PORTAL_ACTIVITY_LABEL.DEAL_CANCELLED,
    };

    const update = {
      portalActivities: [newActivity, ...portalActivities],
    };

    const response = await updateDeal({ dealId, dealUpdate: update, auditDetails });

    return response;
  } catch (error) {
    console.error('Error adding GEF deal cancelled activity %o', error);
    return error;
  }
};
