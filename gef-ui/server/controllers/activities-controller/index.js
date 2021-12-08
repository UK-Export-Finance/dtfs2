const { fromUnixTime } = require('date-fns');
const { getApplication, getUserDetails, getExporter } = require('../../services/api');

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
}));

const getPortalActivities = async (req, res) => {
  const { params, session } = req;
  const { applicationId } = params;
  const { userToken } = session;
  const deal = await getApplication(applicationId);
  console.log(deal.portalActivities);

  // returns objects from IDs stored in gef application
  const maker = await getUserDetails(deal.userId, userToken);
  const checker = await getUserDetails(deal.checkerId, userToken);
  const exporter = await getExporter(deal.exporterId);

  const mappedPortalActivities = mapPortalActivities(deal.portalActivities);

  /*
  as activities does not have access to parameters in application-details
  each has to be obtained and rendered to populate the blue status banner
  */
  return res.render('partials/application-activity.njk', {
    activeSubNavigation: 'activities',
    applicationId,
    portalActivities: mappedPortalActivities,
    bankInternalRefName: deal.bankInternalRefName,
    additionalRefName: deal.additionalRefName,
    ukefDealId: deal.ukefDealId,
    applicationStatus: deal.status,
    applicationType: deal.submissionType,
    submissionCount: deal.submissionCount,
    checkedBy: `${checker.firstname} ${checker.surname}`,
    createdBy: `${maker.firstname} ${maker.surname}`,
    companyName: exporter.details.companyName,
    dateCreated: deal.createdAt,
    timezone: maker.timezone || 'Europe/London',
    submissionDate: deal.submissionDate,
  });
};

module.exports = { getPortalActivities, mapPortalActivities };
