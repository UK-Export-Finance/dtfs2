const { fromUnixTime } = require('date-fns');
const { getApplication, getUserDetails } = require('../../services/api');

// maps portalActivities array to create array in correct format for mojTimeline
const mapPortalActivities = (portalActivities) => portalActivities.map((portalActivity) => ({
  label: {
    text: portalActivity.label,
  },
  text: portalActivity.text,
  datetime: {
    timestamp: fromUnixTime(new Date(portalActivity.timestamp)),
    type: 'datetime',
  },
  byline: {
    text: `${portalActivity.author.firstName} ${portalActivity.author.lastName}`,
  },
  html: portalActivity.html,
  facilityType: portalActivity.facilityType,
  ukefFacilityId: portalActivity.ukefFacilityId,
  facilityId: portalActivity.facilityId,
  maker: portalActivity.maker,
  checker: portalActivity.checker,
}));

const getPortalActivities = async (req, res) => {
  const { params, session } = req;
  const { dealId } = params;
  const { userToken } = session;
  const deal = await getApplication(dealId);

  // returns objects from IDs stored in gef application
  const checker = await getUserDetails(deal.checkerId, userToken);

  const mappedPortalActivities = mapPortalActivities(deal.portalActivities);

  /*
  as activities does not have access to parameters in application-details
  each has to be obtained and rendered to populate the blue status banner
  */
  return res.render('partials/application-activity.njk', {
    activeSubNavigation: 'activities',
    dealId,
    portalActivities: mappedPortalActivities,
    bankInternalRefName: deal.bankInternalRefName,
    additionalRefName: deal.additionalRefName,
    ukefDealId: deal.ukefDealId,
    applicationStatus: deal.status,
    applicationType: deal.submissionType,
    submissionCount: deal.submissionCount,
    checkedBy: `${checker.firstname} ${checker.surname}`,
    createdBy: `${deal.maker.firstname} ${deal.maker.surname}`,
    companyName: deal.exporter.companyName,
    dateCreated: deal.createdAt,
    timezone: deal.maker.timezone || 'Europe/London',
    submissionDate: deal.submissionDate,
    manualInclusionNoticeSubmissionDate: deal?.manualInclusionNoticeSubmissionDate,
  });
};

module.exports = { getPortalActivities, mapPortalActivities };
