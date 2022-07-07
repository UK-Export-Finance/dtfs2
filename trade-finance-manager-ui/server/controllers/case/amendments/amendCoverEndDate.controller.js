const { format, fromUnixTime, getUnixTime } = require('date-fns');
const api = require('../../../api');
const { coverEndDateValidation } = require('./validation/amendCoverEndDateDate.validate');
const { AMENDMENT_STATUS } = require('../../../constants/amendments');
const { latestAmendmentCoverEndDateAccepted } = require('../../helpers/amendments.helper');

const getAmendCoverEndDate = async (req, res) => {
  const { facilityId, amendmentId } = req.params;
  const { data: amendment, status } = await api.getAmendmentById(facilityId, amendmentId);

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

  const facility = await api.getFacility(facilityId);
  const { data: latestAmendment } = await api.getLatestCompletedAmendment(facilityId, amendmentId);
  let currentCoverEndDate = format(new Date(facility.facilitySnapshot.dates.coverEndDate), 'dd MMMM yyyy');

  // if currentCoverEndDate exists, then use it
  if (latestAmendment.currentCoverEndDate) {
    currentCoverEndDate = format(fromUnixTime(latestAmendment.currentCoverEndDate), 'dd MMMM yyyy');
  }

  if (latestAmendmentCoverEndDateAccepted(latestAmendment)) {
    currentCoverEndDate = format(fromUnixTime(latestAmendment.coverEndDate), 'dd MMMM yyyy');
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
  const { data: amendment } = await api.getAmendmentById(facilityId, amendmentId);
  const { dealId } = amendment;
  const facility = await api.getFacility(facilityId);
  const { data: latestAmendment } = await api.getLatestCompletedAmendment(facilityId);

  let currentCoverEndDate = format(new Date(facility.facilitySnapshot.dates.coverEndDate), 'dd MMMM yyyy');

  // if currentCoverEndDate exists, then use it
  if (latestAmendment.currentCoverEndDate) {
    currentCoverEndDate = format(fromUnixTime(latestAmendment.currentCoverEndDate), 'dd MMMM yyyy');
  }

  if (latestAmendmentCoverEndDateAccepted(latestAmendment)) {
    currentCoverEndDate = format(fromUnixTime(latestAmendment.coverEndDate), 'dd MMMM yyyy');
  }

  const { coverEndDate, errorsObject, coverEndDateErrors } = await coverEndDateValidation(req.body, currentCoverEndDate);

  if (coverEndDateErrors.length) {
    const isEditable = amendment.status === AMENDMENT_STATUS.IN_PROGRESS && amendment.changeCoverEndDate;
    return res.render('case/amendments/amendment-cover-end-date.njk', {
      dealId: amendment.dealId,
      facilityId,
      isEditable,
      coverEndDateDay: errorsObject.coverEndDateDay,
      coverEndDateMonth: errorsObject.coverEndDateMonth,
      coverEndDateYear: errorsObject.coverEndDateYear,
      errors: errorsObject.errors,
      currentCoverEndDate,
      user: req.session.user,
    });
  }

  try {
    let formatCurrentCoverEndDate = currentCoverEndDate;
    // convert the current end date to EPOCH format
    formatCurrentCoverEndDate = getUnixTime((new Date(formatCurrentCoverEndDate)).setHours(2, 2, 2, 2));
    const payload = { coverEndDate, currentCoverEndDate: formatCurrentCoverEndDate };
    const { status } = await api.updateAmendment(facilityId, amendmentId, payload);

    if (status === 200) {
      if (amendment.changeFacilityValue) {
        return res.redirect(`/case/${amendment.dealId}/facility/${facilityId}/amendment/${amendmentId}/facility-value`);
      }
      return res.redirect(`/case/${amendment.dealId}/facility/${facilityId}/amendment/${amendmentId}/check-answers`);
    }
    console.error('Unable to update the cover end date');
    return res.redirect(`/case/${dealId}/facility/${facilityId}#amendments`);
  } catch (err) {
    console.error('There was a problem adding the cover end date %O', { response: err?.response?.data });
    return res.redirect(`/case/${amendment.dealId}/facility/${facilityId}#amendments`);
  }
};

module.exports = { getAmendCoverEndDate, postAmendCoverEndDate };
