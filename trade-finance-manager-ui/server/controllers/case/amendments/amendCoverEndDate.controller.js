const { format, fromUnixTime, getUnixTime } = require('date-fns');
const { TFM_AMENDMENT_STATUS, convertUnixTimestampWithoutMilliseconds } = require('@ukef/dtfs2-common');
const { HttpStatusCode } = require('axios');
const api = require('../../../api');
const { coverEndDateValidation } = require('./validation/amendCoverEndDateDate.validate');

/**
 * Gets the next page url based on the current state of the facility
 * @param {boolean} changeFacilityValue if the facility value is to be changed
 * @param {boolean} showFacilityEndDatePage if the facility end date page should be shown
 * @param {string} baseUrl the base url to create the next page url
 * @returns {string} next page url
 */
const getNextPageUrl = ({ changeFacilityValue, showFacilityEndDatePage, baseUrl }) => {
  if (showFacilityEndDatePage) {
    return `${baseUrl}/is-using-facility-end-date`;
  }

  if (changeFacilityValue) {
    return `${baseUrl}/facility-value`;
  }

  return `${baseUrl}/check-answers`;
};

const getAmendCoverEndDate = async (req, res) => {
  const { facilityId, amendmentId } = req.params;
  const { userToken } = req.session;
  const { data: amendment, status } = await api.getAmendmentById(facilityId, amendmentId, userToken);

  if (status !== HttpStatusCode.Ok) {
    return res.redirect('/not-found');
  }

  const isEditable = amendment.status === TFM_AMENDMENT_STATUS.IN_PROGRESS && amendment.changeCoverEndDate;
  const { dealId, coverEndDate } = amendment;

  let coverEndDateDay = '';
  let coverEndDateMonth = '';
  let coverEndDateYear = '';

  if (amendment.coverEndDate) {
    const formattedCoverEndDate = convertUnixTimestampWithoutMilliseconds(coverEndDate);

    coverEndDateDay = format(fromUnixTime(formattedCoverEndDate), 'dd');
    coverEndDateMonth = format(fromUnixTime(formattedCoverEndDate), 'M');
    coverEndDateYear = format(fromUnixTime(formattedCoverEndDate), 'yyyy');
  }

  const facility = await api.getFacility(facilityId, userToken);
  const { data: latestAmendmentCoverEndDate } = await api.getLatestCompletedAmendmentDate(facilityId, userToken);

  let currentCoverEndDate = format(new Date(facility.facilitySnapshot.dates.coverEndDate), 'dd MMMM yyyy');

  if (latestAmendmentCoverEndDate?.coverEndDate) {
    currentCoverEndDate = format(fromUnixTime(latestAmendmentCoverEndDate.coverEndDate), 'dd MMMM yyyy');
  }

  return res.render('case/amendments/amendment-cover-end-date.njk', {
    dealId,
    facilityId,
    isEditable,
    coverEndDateDay,
    coverEndDateMonth,
    coverEndDateYear,
    currentCoverEndDate,
    user: req.session.user,
  });
};

const postAmendCoverEndDate = async (req, res) => {
  const { facilityId, amendmentId } = req.params;
  const { userToken } = req.session;
  const { data: amendment } = await api.getAmendmentById(facilityId, amendmentId, userToken);
  const { dealId, changeFacilityValue } = amendment;
  const facility = await api.getFacility(facilityId, userToken);
  const { data: latestAmendmentCoverEndDate } = await api.getLatestCompletedAmendmentDate(facilityId, userToken);

  let currentCoverEndDate = format(new Date(facility.facilitySnapshot.dates.coverEndDate), 'dd MMMM yyyy');

  if (latestAmendmentCoverEndDate?.coverEndDate) {
    currentCoverEndDate = format(fromUnixTime(latestAmendmentCoverEndDate.coverEndDate), 'dd MMMM yyyy');
  }

  const { coverEndDate, errorsObject, coverEndDateErrors } = coverEndDateValidation(req.body, currentCoverEndDate);

  if (coverEndDateErrors.length) {
    const isEditable = amendment.status === TFM_AMENDMENT_STATUS.IN_PROGRESS && amendment.changeCoverEndDate;
    return res.render('case/amendments/amendment-cover-end-date.njk', {
      dealId: amendment.dealId,
      facilityId,
      isEditable,
      coverEndDateDay: errorsObject.coverEndDay,
      coverEndDateMonth: errorsObject.coverEndMonth,
      coverEndDateYear: errorsObject.coverEndYear,
      errors: errorsObject.errors,
      currentCoverEndDate,
      user: req.session.user,
    });
  }

  const baseUrl = `/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}`;
  const fallbackUrl = `/case/${dealId}/facility/${facilityId}#amendments`;

  try {
    let formatCurrentCoverEndDate = currentCoverEndDate;
    // convert the current end date to EPOCH format
    formatCurrentCoverEndDate = getUnixTime(new Date(formatCurrentCoverEndDate).setHours(2, 2, 2, 2));

    const payload = { coverEndDate, currentCoverEndDate: formatCurrentCoverEndDate };

    const { status } = await api.updateAmendment(facilityId, amendmentId, payload, userToken);

    if (status !== HttpStatusCode.Ok) {
      throw new Error('Error updating amendment with cover end date');
    }

    const showFacilityEndDatePage = facility.facilitySnapshot.isGef;

    return res.redirect(getNextPageUrl({ changeFacilityValue, showFacilityEndDatePage, baseUrl }));
  } catch (error) {
    console.error('There was a problem adding the cover end date %o', error);
    return res.redirect(fallbackUrl);
  }
};

module.exports = { getAmendCoverEndDate, postAmendCoverEndDate, getNextPageUrl };
