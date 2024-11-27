// TODO: TS?
const { getUnixTime } = require('date-fns');
const { updateDeal } = require('./update-deal');
const { PORTAL_ACTIVITY_LABEL, PORTAL_ACTIVITY_TYPE } = require('../../../../constants');

/**
 * @param {string | ObjectId} addGefDealCancelledActivity.dealId - the dealId
 * @param {import('@ukef/dtfs2-common').Activity[]} addGefDealCancelledActivity.portalActivities - previous/existing portal activities
 * @param {import('@ukef/dtfs2-common').ActivityAuthor} addGefDealCancelledActivity.author - the activities author
 * @param {import('@ukef/dtfs2-common').AuditDetails} addGefDealCancelledActivity.auditDetails - the users audit details
 * @returns {Promise<('@ukef/dtfs2-common').Deal>}
 */
const addGefDealCancelledActivity = async ({ dealId, portalActivities, author, auditDetails }) => {
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
};

exports.addGefDealCancelledActivity = addGefDealCancelledActivity;
