const { fromUnixTime, format } = require('date-fns');
const { timezone, DATE_FORMATS, isPortalFacilityAmendmentsFeatureFlagEnabled } = require('@ukef/dtfs2-common');
const { getApplication, getUserDetails } = require('../../services/api');

// maps portalActivities array to create array in correct format for mojTimeline
const mapPortalActivities = (dealId, portalActivities) =>
  portalActivities.map(({ label, text, timestamp, author, facilityType, ukefFacilityId, facilityId, amendmentId, maker, checker, scheduledCancellation }) => {
    let byline = author.firstName;
    let amendmentUrl = '';

    if (author.lastName) {
      byline += ` ${author.lastName}`;
    }

    if (amendmentId) {
      amendmentUrl = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/amendment-details`;
    }
    const date = fromUnixTime(new Date(timestamp));

    const mappedActivity = {
      title: label,
      text,
      date: format(date, DATE_FORMATS.D_MMMM_YYYY),
      time: format(date, DATE_FORMATS.H_MMAAA),
      byline,
      facilityType,
      ukefFacilityId,
      facilityId,
      amendmentUrl,
      maker,
      checker,
      scheduledCancellation,
    };

    return mappedActivity;
  });

/**
 * Retrieves portal activities for a specific deal and renders the application activity page.
 *
 * @param {object} req - The request object.
 * @param {object} req.params - The request parameters.
 * @param {string} req.params.dealId - The ID of the deal.
 * @param {object} req.session - The session object.
 * @param {string} req.session.userToken - The user token.
 * @param {object} res - The response object.
 * @returns {Promise<void>} - Renders the application activity page with the relevant data.
 */
const getPortalActivities = async (req, res) => {
  const { params, session } = req;
  const { dealId } = params;
  const { userToken } = session;

  const deal = await getApplication({ dealId, userToken });
  const checker = await getUserDetails({ userId: deal.checkerId, userToken });
  const portalActivities = mapPortalActivities(deal._id, deal.portalActivities);
  const checkedBy = `${checker.firstname} ${checker.surname}`;
  const createdBy = `${deal.maker.firstname} ${deal.maker.surname}`;
  const isFeatureFlagEnabled = isPortalFacilityAmendmentsFeatureFlagEnabled();

  /*
  As activities does not have access to parameters in application-details
  each has to be obtained and rendered to populate the application banner
  */
  return res.render('partials/application-activity.njk', {
    isFeatureFlagEnabled,
    activeSubNavigation: 'activities',
    dealId,
    previousStatus: deal.previousStatus,
    portalActivities,
    bankInternalRefName: deal.bankInternalRefName,
    additionalRefName: deal.additionalRefName,
    ukefDealId: deal.ukefDealId,
    applicationStatus: deal.status,
    applicationType: deal.submissionType,
    submissionCount: deal.submissionCount,
    checkedBy,
    createdBy,
    companyName: deal.exporter.companyName,
    dateCreated: deal.createdAt,
    timezone: deal.maker.timezone || timezone,
    submissionDate: deal.submissionDate,
    manualInclusionNoticeSubmissionDate: deal?.manualInclusionNoticeSubmissionDate,
  });
};

module.exports = { getPortalActivities, mapPortalActivities };
