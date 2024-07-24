const { format, fromUnixTime, getUnixTime } = require('date-fns');
const api = require('../../../api');
const { coverEndDateValidation } = require('./validation/amendCoverEndDateDate.validate');
const { AMENDMENT_STATUS } = require('../../../constants/amendments');

const getAmendCoverEndDate = async (req, res) => {
  const { facilityId, amendmentId } = req.params;
  const { userToken } = req.session;
  const { data: amendment, status } = await api.getAmendmentById(facilityId, amendmentId, userToken);

  if (status !== 200) {
    return res.redirect('/not-found');
  }

  const isEditable = amendment.status === AMENDMENT_STATUS.IN_PROGRESS && amendment.changeCoverEndDate;
  const { dealId, coverEndDate } = amendment;

  let coverEndDateDay = '';
  let coverEndDateMonth = '';
  let coverEndDateYear = '';
  if (amendment.coverEndDate) {
    coverEndDateDay = format(fromUnixTime(coverEndDate), 'dd');
    coverEndDateMonth = format(fromUnixTime(coverEndDate), 'M');
    coverEndDateYear = format(fromUnixTime(coverEndDate), 'yyyy');
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
  const { dealId } = amendment;
  const facility = await api.getFacility(facilityId, userToken);
  const { data: latestAmendmentCoverEndDate } = await api.getLatestCompletedAmendmentDate(facilityId, userToken);

  let currentCoverEndDate = format(new Date(facility.facilitySnapshot.dates.coverEndDate), 'dd MMMM yyyy');

  if (latestAmendmentCoverEndDate?.coverEndDate) {
    currentCoverEndDate = format(fromUnixTime(latestAmendmentCoverEndDate.coverEndDate), 'dd MMMM yyyy');
  }

  const { coverEndDate, errorsObject, coverEndDateErrors } = coverEndDateValidation(req.body, currentCoverEndDate);

  if (coverEndDateErrors.length) {
    const isEditable = amendment.status === AMENDMENT_STATUS.IN_PROGRESS && amendment.changeCoverEndDate;
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

  try {
    let formatCurrentCoverEndDate = currentCoverEndDate;
    // convert the current end date to EPOCH format
    formatCurrentCoverEndDate = getUnixTime(new Date(formatCurrentCoverEndDate).setHours(2, 2, 2, 2));
    const payload = { coverEndDate, currentCoverEndDate: formatCurrentCoverEndDate };
    const { status } = await api.updateAmendment(facilityId, amendmentId, payload, userToken);

    if (status === 200) {
      if (amendment.changeFacilityValue) {
        return res.redirect(`/case/${amendment.dealId}/facility/${facilityId}/amendment/${amendmentId}/facility-value`);
      }
      return res.redirect(`/case/${amendment.dealId}/facility/${facilityId}/amendment/${amendmentId}/check-answers`);
    }
    console.error('Unable to update the cover end date');
    return res.redirect(`/case/${dealId}/facility/${facilityId}#amendments`);
  } catch (error) {
    console.error('There was a problem adding the cover end date %o', error);
    return res.redirect(`/case/${amendment.dealId}/facility/${facilityId}#amendments`);
  }
};

module.exports = { getAmendCoverEndDate, postAmendCoverEndDate };
