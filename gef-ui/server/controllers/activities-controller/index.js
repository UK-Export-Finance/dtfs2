const { fromUnixTime, format } = require('date-fns');
const { timeZoneConfig, DATE_FORMATS } = require('@ukef/dtfs2-common');
const { getApplication, getUserDetails } = require('../../services/api');

// maps portalActivities array to create array in correct format for mojTimeline
const mapPortalActivities = (portalActivities) =>
  portalActivities.map(({ label, timestamp, author, facilityType, ukefFacilityId, facilityId, maker, checker }) => {
    let byline = author.firstName;

    if (author.lastName) {
      byline += ` ${author.lastName}`;
    }

    const date = fromUnixTime(new Date(timestamp));

    const mappedActivity = {
      heading: label,
      date: format(date, DATE_FORMATS.D_MMMM_YYYY),
      time: format(date, DATE_FORMATS.H_MMAAA),
      byline,
      facilityType,
      ukefFacilityId,
      facilityId,
      maker,
      checker,
    };

    return mappedActivity;
  });

const getPortalActivities = async (req, res) => {
  const { params, session } = req;
  const { dealId } = params;
  const { userToken } = session;
  const deal = await getApplication({ dealId, userToken });

  // returns objects from IDs stored in gef application
  const checker = await getUserDetails({ userId: deal.checkerId, userToken });

  const mappedPortalActivities = mapPortalActivities(deal.portalActivities);

  /*
  as activities does not have access to parameters in application-details
  each has to be obtained and rendered to populate the application banner
  */
  return res.render('partials/application-activity.njk', {
    activeSubNavigation: 'activities',
    dealId,
    previousStatus: deal.previousStatus,
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
    timezone: deal.maker.timezone || timeZoneConfig.DEFAULT,
    submissionDate: deal.submissionDate,
    manualInclusionNoticeSubmissionDate: deal?.manualInclusionNoticeSubmissionDate,
  });
};

module.exports = { getPortalActivities, mapPortalActivities };
