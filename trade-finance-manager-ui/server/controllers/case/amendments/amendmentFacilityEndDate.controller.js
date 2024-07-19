const { isTfmFacilityEndDateFeatureFlagEnabled } = require('@ukef/dtfs2-common');
const { format, fromUnixTime, getUnixTime } = require('date-fns');
const api = require('../../../api');
const { AMENDMENT_STATUS } = require('../../../constants/amendments');
const { facilityEndDateValidation } = require('./validation/amendmentFacilityEndDate.validate');

const getAmendmentFacilityEndDate = async (req, res) => {
  const { facilityId, amendmentId } = req.params;
  const { userToken } = req.session;
  const { data: amendment, status } = await api.getAmendmentById(facilityId, amendmentId, userToken);

  if (status !== 200) {
    return res.redirect('/not-found');
  }

  if (!amendment.changeCoverEndDate || !isTfmFacilityEndDateFeatureFlagEnabled()) {
    return res.redirect(`/case/${amendment.dealId}/facility/${facilityId}/amendment/${amendmentId}/amendment-options`);
  }

  // if (!amendment.isUsingFacilityEndDate) {
  //   return res.redirect(`/case/${amendment.dealId}/facility/${facilityId}/amendment/${amendmentId}/is-using-facility-end-date`);
  // }

  const isEditable =
    amendment.status === AMENDMENT_STATUS.IN_PROGRESS &&
    amendment.changeCoverEndDate &&
    isTfmFacilityEndDateFeatureFlagEnabled() &&
    amendment.isUsingFacilityEndDate;

  const { dealId, facilityEndDate } = amendment;

  let facilityEndDateDay = '';
  let facilityEndDateMonth = '';
  let facilityEndDateYear = '';
  if (amendment.facilityEndDate) {
    facilityEndDateDay = format(fromUnixTime(facilityEndDate), 'dd');
    facilityEndDateMonth = format(fromUnixTime(facilityEndDate), 'M');
    facilityEndDateYear = format(fromUnixTime(facilityEndDate), 'yyyy');
  }

  // const facility = await api.getFacility(facilityId, userToken);
  // const { data: latestAmendmentFacilityEndDate } = await api.getLatestCompletedAmendmentFacilityEndDate(facilityId, userToken);
  //
  // let currentFacilityEndDate = format(new Date(facility.facilitySnapshot.dates?.facilityEndDate), 'dd MMMM yyyy');
  //
  // if (latestAmendmentFacilityEndDate?.facilityEndDate) {
  //   currentFacilityEndDate = format(fromUnixTime(latestAmendmentFacilityEndDate.facilityEndDate), 'dd MMMM yyyy');
  // }

  return res.render('case/amendments/amendment-facility-end-date.njk', {
    dealId,
    facilityId,
    isEditable,
    facilityEndDateDay,
    facilityEndDateMonth,
    facilityEndDateYear,
    // currentFacilityEndDate,
    user: req.session.user,
  });
};

const postAmendmentFacilityEndDate = async (req, res) => {
  const { facilityId, amendmentId } = req.params;
  const { userToken } = req.session;
  const { data: amendment } = await api.getAmendmentById(facilityId, amendmentId, userToken);
  const { dealId } = amendment;
  const facility = await api.getFacility(facilityId, userToken);
  const { isUsingFacilityEndDate } = req.body;

  // let currentCoverEndDate = format(new Date(facility.facilitySnapshot.dates.facilityEndDate), 'dd MMMM yyyy');

  // if (latestAmendmentCoverEndDate?.coverEndDate) {
  //   currentCoverEndDate = format(fromUnixTime(latestAmendmentCoverEndDate.coverEndDate), 'dd MMMM yyyy');
  // }

  const { facilityEndDate, errorsObject, facilityEndDateErrors } = facilityEndDateValidation(req.body);

  if (facilityEndDateErrors.length) {
    const isEditable = amendment.status === AMENDMENT_STATUS.IN_PROGRESS && amendment.changeCoverEndDate && isTfmFacilityEndDateFeatureFlagEnabled();
    return res.render('case/amendments/amendment-facility-end-date.njk', {
      dealId,
      facilityId,
      isEditable,
      facilityEndDateDay: errorsObject.coverEndDay,
      facilityEndDateMonth: errorsObject.coverEndMonth,
      facilityEndDateYear: errorsObject.coverEndYear,
      errors: errorsObject.errors,
      user: req.session.user,
    });
  }

  try {
    const payload = { facilityEndDate };
    const { status } = await api.updateAmendment(facilityId, amendmentId, payload, userToken);

    if (status === 200) {
      if (amendment.changeFacilityValue) {
        return res.redirect(`/case/${amendment.dealId}/facility/${facilityId}/amendment/${amendmentId}/facility-value`);
      }
      return res.redirect(`/case/${amendment.dealId}/facility/${facilityId}/amendment/${amendmentId}/check-answers`);
    }
    console.error('Unable to update is using facility end date');
    return res.redirect(`/case/${dealId}/facility/${facilityId}#amendments`);
  } catch (error) {
    console.error('There was a problem adding if the bank is using the facility end date', error);
    return res.redirect(`/case/${amendment.dealId}/facility/${facilityId}#amendments`);
  }
};

module.exports = { getAmendmentFacilityEndDate, postAmendmentFacilityEndDate };
